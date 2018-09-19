'use babel';

import {usePackage, configSet} from 'atom-use-package';

//
//
// General options

configSet('core', {
    autoHideMenuBar: true,
    disabledPackages: ['background-tips', 'tabs'],
    openEmptyEditorOnStart: true,
    restorePreviousWindowsOnStart: 'no',
    themes: ['city-lights-ui', 'city-lights-syntax']
});

configSet('editor', {
    tabLength: 4,
    softWrap: false,
    tabType: 'soft',
    preferredLineLength: 100,
    scrollPastEnd: true
});

//
//
// General keybindings

function subwordNavigateCursor(cursor, selection, moveToNext, lookRight) {
    const oldPos = cursor.getBufferPosition();
    moveToNext(cursor, selection);
    const pos = cursor.getBufferPosition();
    if (oldPos.isEqual(pos)) {
        return;
    }
    const line = cursor.getCurrentBufferLine();
    const column = cursor.getScreenColumn();
    const next = lookRight ? line.substr(column, 1) : line.substr(column - 1, 1);
    if (!/\w/.test(next)) {
        subwordNavigateCursor(cursor, selection, moveToNext, lookRight);
    }
}

function subwordNavigate(step, lookRight) {
    return function(event) {
        const editor = event.currentTarget.getModel();
        if (editor && atom.workspace.isTextEditor(editor)) {
            const selection = editor.getSelections();
            editor.getCursors().forEach((cursor, i) => {
                subwordNavigateCursor(cursor, selection[i], step, lookRight);
            });
        }
    };
}

function insertText(text) {
    return function() {
        const editor = atom.workspace.getActiveTextEditor();
        if (editor) editor.insertText(text);
    };
}

atom.commands.add('atom-text-editor', 'custom:insert-left-par', insertText('('));

atom.commands.add('atom-text-editor', 'custom:insert-right-par', insertText(')'));

atom.commands.add('atom-text-editor', 'custom:insert-left-curly', insertText('{'));

atom.commands.add('atom-text-editor', 'custom:insert-right-curly', insertText('}'));

atom.commands.add('atom-text-editor', 'custom:insert-left-bracket', insertText('['));

atom.commands.add('atom-text-editor', 'custom:insert-right-par', insertText(']'));

const darkThemes = ['atom-dark-ui', 'atom-dark-syntax'];
const lightThemes = ['atom-light-ui', 'atom-light-syntax'];

atom.commands.add('atom-workspace', 'application:switch-to-light-theme', _e =>
    configSet('core', {
        themes: lightThemes
    })
);
atom.commands.add('atom-workspace', 'application:switch-to-dark-theme', _e =>
    configSet('core', {
        themes: darkThemes
    })
);

atom.commands.add(
    'atom-workspace atom-text-editor',
    'editor:emacs-move-subword-left',
    subwordNavigate((cursor, _) => cursor.moveToPreviousSubwordBoundary(), true)
);

atom.commands.add(
    'atom-workspace atom-text-editor',
    'editor:emacs-move-subword-right',
    subwordNavigate((cursor, _) => cursor.moveToNextSubwordBoundary(), false)
);

atom.commands.add(
    'atom-workspace atom-text-editor',
    'editor:emacs-select-subword-left',
    subwordNavigate((_, selection) => selection.selectToPreviousSubwordBoundary(), true)
);

atom.commands.add(
    'atom-workspace atom-text-editor',
    'editor:emacs-select-subword-right',
    subwordNavigate((_, selection) => selection.selectToNextSubwordBoundary(), false)
);

atom.commands.add('atom-workspace', 'window:close-docks', _e => {
    const bottomDock = atom.workspace.getBottomDock();
    if (bottomDock.state.visible) {
        bottomDock.toggle();
    }
    const rightDock = atom.workspace.getRightDock();
    if (rightDock.state.visible) {
        rightDock.toggle();
    }
});

atom.keymaps.add(__filename, {
    'atom-workspace atom-text-editor:not([mini])': {
        "ctrl-alt-'": 'editor:split-selections-into-lines',
        'ctrl-a': 'editor:move-to-first-character-of-line',
        'ctrl-e': 'editor:move-to-end-of-line',
        'ctrl-up': 'editor:move-to-beginning-of-previous-paragraph',
        'ctrl-down': 'editor:move-to-beginning-of-next-paragraph'
    },
    'atom-workspace atom-text-editor': {
        'ctrl-left': 'editor:emacs-move-subword-left',
        'ctrl-right': 'editor:emacs-move-subword-right',
        'ctrl-backspace': 'editor:delete-to-beginning-of-subword',
        'ctrl-delete': 'editor:delete-to-end-of-subword',
        'alt-up': 'editor:move-line-up',
        'alt-down': 'editor:move-line-down',
        'ctrl-c c': 'editor:toggle-line-comments',
        'ctrl-5': 'custom:insert-left-par',
        'ctrl-6': 'custom:insert-right-par',
        'ctrl-7': 'custom:insert-left-curly',
        'ctrl-8': 'custom:insert-left-bracket',
        'ctrl-9': 'custom:insert-right-bracket',
        'ctrl-0': 'custom:insert-right-curly'
    },
    'atom-workspace': {
        'ctrl-x left': 'pane:split-left-and-copy-active-item',
        'ctrl-x right': 'pane:split-right-and-copy-active-item',
        'ctrl-x up': 'pane:split-up-and-copy-active-item',
        'ctrl-x down': 'pane:split-down-and-copy-active-item',
        'shift-left': 'window:focus-pane-on-left',
        'shift-right': 'window:focus-pane-on-right',
        'shift-up': 'window:focus-pane-above',
        'shift-down': 'window:focus-pane-below',
        'ctrl-x t': 'tree-view:toggle',
        'ctrl-c s s': 'project-find:toggle',
        'ctrl--': 'core:undo',
        'alt--': 'core:redo',
        'ctrl-c p p': 'application:reopen-project',
        'ctrl-x i': 'symbols-view:toggle-file-symbols',
        'ctrl-c q': 'window:close-docks'
    },
    'atom-workspace atom-text-editor.editor': {
        'ctrl-space': 'selection-mode:toggle'
    },
    'atom-workspace atom-text-editor.editor.selection-mode': {
        'ctrl-g': 'selection-mode:off'
    },
    '.tree-view': {
        enter: 'tree-view:expand-item',
        right: 'tree-view:expand-item',
        left: 'tree-view:collapse-directory'
    }
});

//
//
// Packages
usePackage('last-cursor-position', {
    keymap: {
        'atom-workspace': {
            'ctrl-u ctrl-space': 'last-cursor-position:previous'
        }
    }
});

usePackage('disable-keybindings', {
    config: {
        allBundledPackages: true,
        allCommunityPackages: true,
        exceptCommunityPackages: [],
        prefixKeys: ['ctrl-k']
    }
});

usePackage('file-icons');

usePackage('emacs-plus', {
    keymap: {
        body: {
            'alt-v': 'core:page-up',
            'alt-w': 'core:copy',
            'ctrl-d': 'core:delete',
            'ctrl-g': 'core:cancel',
            'ctrl-h': 'core:backspace',
            'ctrl-m': 'core:confirm',
            'ctrl-n': 'core:move-down',
            'ctrl-p': 'core:move-up',
            'ctrl-v': 'core:page-down',
            'ctrl-w': 'core:cut'
        },
        'atom-workspace': {
            'alt-x': 'command-palette:toggle',
            'ctrl-x 0': 'pane:close',
            'ctrl-x 1': 'emacs-plus:close-other-panes',
            'ctrl-x 2': 'pane:split-down-and-copy-active-item',
            'ctrl-x 3': 'pane:split-right-and-copy-active-item',
            'ctrl-x b': 'fuzzy-finder:toggle-buffer-finder',
            'ctrl-x ctrl-c': 'application:quit',
            'ctrl-x ctrl-f': 'advanced-open-file:toggle',
            'ctrl-x ctrl-j': 'tree-view:reveal-active-file',
            'ctrl-x k': 'core:close',
            'ctrl-x o': 'window:focus-next-pane'
        },
        'atom-workspace atom-text-editor': {
            'ctrl-/': 'core:undo',
            'ctrl-_': 'core:undo',
            'ctrl-a': 'editor:move-to-beginning-of-line',
            'ctrl-b': 'core:move-left',
            'ctrl-e': 'editor:move-to-end-of-screen-line',
            'ctrl-f': 'core:move-right',
            'ctrl-g': 'editor:consolidate-selections',
            'ctrl-t': 'editor:transpose',
            'ctrl-y': 'core:paste',
            'alt-b': 'editor:move-to-beginning-of-word',
            'alt-f': 'editor:move-to-end-of-word',
            'alt-right': 'editor:move-to-end-of-word',
            'ctrl-alt-/': 'core:redo',
            'ctrl-x ctrl-l': 'editor:lower-case',
            'ctrl-x ctrl-u': 'editor:upper-case',
            'ctrl-x u': 'core:undo'
        },
        'atom-workspace atom-text-editor.emacs-plus:not([mini])': {
            'alt-.': 'symbols-view:toggle-file-symbols',
            'alt-/': 'autocomplete-plus:activate',
            'alt-;': 'editor:toggle-line-comments',
            'alt-<': 'core:move-to-top',
            'alt->': 'core:move-to-bottom',
            'alt-\\': 'emacs-plus:delete-horizontal-space',
            'alt-^': 'emacs-plus:delete-indentation',
            'alt-backspace': 'emacs-plus:backward-kill-word',
            'alt-c': 'emacs-plus:capitalize-word',
            'alt-d': 'emacs-plus:kill-word',
            'alt-delete': 'emacs-plus:backward-kill-word',
            'alt-g g': 'go-to-line:toggle',
            'alt-left': 'editor:move-to-beginning-of-word',
            'alt-m': 'editor:move-to-first-character-of-line',
            'alt-q': 'autoflow:reflow-selection',
            'alt-space': 'emacs-plus:just-one-space',
            'alt-t': 'emacs-plus:transpose-words',
            'alt-w': 'emacs-plus:copy',
            'alt-{': 'editor:move-to-beginning-of-previous-paragraph',
            'alt-}': 'editor:move-to-beginning-of-next-paragraph',
            'ctrl-alt-w': 'emacs-plus:append-next-kill',
            'ctrl-i': 'editor:auto-indent',
            'ctrl-j': 'editor:newline',
            'ctrl-k': 'emacs-plus:kill-line',
            'ctrl-l': 'emacs-plus:recenter-top-bottom',
            'ctrl-m': 'editor:newline',
            'ctrl-o': 'emacs-plus:open-line',
            'ctrl-r': 'find-and-replace:show',
            'ctrl-s': 'find-and-replace:show',
            'ctrl-shift-backspace': 'emacs-plus:kill-whole-line',
            // 'ctrl-space': 'emacs-plus:set-mark',
            'ctrl-w': 'emacs-plus:kill-region',
            'ctrl-x ctrl-s': 'core:save',
            'ctrl-x ctrl-t': 'emacs-plus:transpose-lines',
            // 'ctrl-x ctrl-x': 'emacs-plus:exchange-point-and-mark',
            'ctrl-x h': 'core:select-all'
        },
        'atom-workspace atom-text-editor.emacs-plus.mark-mode:not([mini])': {
            'alt-<': 'core:select-to-top',
            'alt->': 'core:select-to-bottom',
            'alt-b': 'editor:select-to-beginning-of-word',
            'alt-f': 'editor:select-to-end-of-word',
            'alt-left': 'editor:select-to-beginning-of-word',
            'alt-right': 'editor:select-to-end-of-word',
            'alt-v': 'core:select-page-up',
            'alt-{': 'editor:select-to-beginning-of-previous-paragraph',
            'alt-}': 'editor:select-to-beginning-of-next-paragraph',
            'ctrl-a': 'editor:select-to-beginning-of-line',
            'ctrl-b': 'core:select-left',
            'ctrl-e': 'editor:select-to-end-of-line',
            'ctrl-f': 'core:select-right',
            'ctrl-g': 'core:cancel',
            'ctrl-n': 'core:select-down',
            'ctrl-p': 'core:select-up',
            'ctrl-v': 'core:select-page-down',
            down: 'core:select-down',
            left: 'core:select-left',
            right: 'core:select-right',
            up: 'core:select-up'
        },
        '.find-and-replace': {
            'ctrl-r': 'find-and-replace:find-previous',
            'ctrl-s': 'find-and-replace:find-next'
        },
        'atom-workspace atom-text-editor:not(mini).emacs-plus.autocomplete-active': {
            'ctrl-g': 'autocomplete-plus:cancel',
            'ctrl-m': 'autocomplete-plus:confirm',
            enter: 'autocomplete-plus:confirm'
        },
        '.tree-view': {
            '^': 'tree-view:collapse-directory',
            'ctrl-m': 'tree-view:open-selected-entry',
            n: 'core:move-down',
            p: 'core:move-up',
            q: 'tree-view:toggle',
            'shift-c': 'tree-view:duplicate',
            'shift-d': 'tree-view:remove',
            'shift-e': 'tree-view:recursive-expand-directory',
            'shift-r': 'tree-view:rename'
        },
        '.advanced-open-file atom-text-editor': {
            'ctrl-i': 'advanced-open-file:autocomplete',
            'ctrl-p': 'advanced-open-file:move-cursor-up',
            'ctrl-n': 'advanced-open-file:move-cursor-down',
            'ctrl-w': 'advanced-open-file:delete-path-component',
            'ctrl-/': 'advanced-open-file:undo'
        }
    }
});

usePackage('emacs-tab', {
    enableKeys: true
});

usePackage('join-lines-smarter', {
    keymap: {
        'atom-workspace atom-text-editor': {
            'alt-j': 'join-lines-smarter:join-lines'
        }
    }
});

usePackage('advanced-open-file', {
    config: {
        createDirectories: true,
        createFileInstantly: true,
        helmDirSwitch: true
    },
    keymap: {
        '.advanced-open-file atom-text-editor': {
            up: 'advanced-open-file:move-cursor-up',
            down: 'advanced-open-file:move-cursor-down',
            left: 'advanced-open-file:delete-path-component',
            right: 'advanced-open-file:autocomplete',
            tab: 'advanced-open-file:autocomplete',
            'ctrl-i': 'advanced-open-file:autocomplete',
            'ctrl-p': 'advanced-open-file:move-cursor-up',
            'ctrl-n': 'advanced-open-file:move-cursor-down',
            'ctrl-w': 'advanced-open-file:delete-path-component',
            'ctrl-/': 'advanced-open-file:undo'
        }
    }
});

// Have to be manually installed for some reason.
usePackage('selection-mode');

usePackage('incsearch', {
    keymap: {
        'atom-workspace atom-text-editor.emacs-plus:not([mini])': {
            'ctrl-s': 'toggle',
            'ctrl-r': 'toggle'
        },
        '.incsearch': {
            'ctrl-s': 'incsearch:goto:next-match',
            'ctrl-r': 'incsearch:goto:prev-match'
        }
    }
});

usePackage('clipboard-history', {
    keymap: {
        'atom-text-editor:not([mini])': {
            'alt-y': 'paste'
        }
    }
});

usePackage('expand-region', {
    keymap: {
        'atom-workspace atom-text-editor:not([mini])': {
            'ctrl-ä': 'expand',
            'ctrl-alt-ä': 'shrink'
        }
    }
});

usePackage('keybinding-cheatsheet', {
    keymap: {
        'atom-workspace': {
            'ctrl-h ctrl-m': 'toggle'
        }
    }
});

usePackage('keybinding-resolver', {
    keymap: {
        'atom-workspace': {
            'ctrl-h k': 'key-binding-resolver:toggle'
        }
    }
});

usePackage('fuzzy-finder', {
    keymap: {
        'atom-workspace': {
            'ctrl-x f': 'toggle-file-finder'
        }
    }
});
// usePackage("magic-reflow", {
//   keymap: {
//     "atom-workspace atom-text-editor.emacs-plus:not([mini])": {
//       "alt-q": "reflow"
//     }
//   }
// });

usePackage('autocomplete-plus', {
    keymap: {
        'atom-text-editor:not([mini])': {
            'ctrl-.': 'activate'
        }
    },
    config: {
        enableAutoActivation: false,
        confirmCompletion: 'tab and enter',
        enableAutoConfirmSingleSuggestion: false,
        enableExtendedUnicodeSupport: true
    }
});

usePackage('github', {
    keymap: {
        'atom-workspace': {
            'ctrl-x g': 'github:toggle-git-tab'
        }
    }
});

// usePackage("jumpy", {
//   keymap: {
//     "atom-text-editor:not([mini])": {
//       "ctrl-;": "toggle"
//     },
//     "atom-text-editor.jumpy-jump-mode:not([mini])": {
//       backspace: "reset",
//       "ctrl-g": "clear"
//     }
//   }
// });

// usePackage("trailing-spaces");
// usePackage("spaces-in-braces");

usePackage('undo-tree');

// usePackage("file-watcher", {
//   config: {
//     autoReload: true
//   }
// });

// usePackage("docblockr", {
//   enableKeys: true
// });

//
//
// Build

// usePackage("build", {
//   config: {
//     panelVisibility: "Keep Visible",
//     refreshOnShowTargetList: true,
//     buildOnSave: false,
//     saveOnBuild: true,
//     scrollOnError: true,
//     stealFocus: false
//   },
//   keymap: {
//     "atom-workspace": {
//       "ctrl-c b c": "select-active-target",
//       "ctrl-c b b": "toggle-panel",
//       "ctrl-c ctrl-s": "trigger"
//     }
//   }
// });

// usePackage("build-tools", {
//   keymap: {
//     "atom-workspace": {
//       "ctrl-c p shift-p": "first-command-ask",
//       "ctrl-c ctrl-s": "first-command",
//       "ctrl-c p c": "commands",
//       "ctrl-c p p": "toggle",
//       "ctrl-l ctrl-s": "unset!"
//     }
//   }
// });

//
//
// Atom IDE

usePackage('atom-ide-ui', {
    keymap: {
        'atom-workspace atom-text-editor.enable-atom-ide-find-references': {
            'ctrl-c ctrl-f': 'code-format:format-code'
        },
        'atom-workspace atom-text-editor.emacs-plus:not([mini])': {
            'alt-,': 'signature-help:show',
            'ctrl-alt-,': 'datatip:toggle',
            'alt-.': 'hyperclick:confirm-cursor'
            // "alt-n": "diagnostics:go-to-next-diagnostic",
            // "alt-p": "diagnostics:go-to-previous-diagnostic",
            // "ctrl-c s": "diagnostics:show-actions-at-position",
            // "ctrl-c alt-s": "diagnostics:fix-all-in-current-file",
            // "ctrl-c r": "find-references:activate",
        },
        'atom-workspace': {
            // "ctrl-c t": "outline-view:toggle",
            // "ctrl-c l": "diagnostics:toggle-table"
        }
    },
    config: {
        'atom-ide-find-references': {
            defaultLocationForPane: 'right'
        },
        use: {
            'atom-ide-diagnostics-ui': 'never'
        }
    }
});

usePackage('ide-typescript', {
    config: {
        returnTypeInAutocomplete: 'right',
        diagnosticsEnabled: false
    }
});

//
//
// JavaScript

usePackage('language-babel');

usePackage('linter', {
    config: {
        lintOnChange: false
    }
});

usePackage('linter-eslint', {
    keymap: {
        "atom-workspace atom-text-editor[data-grammar='source js jsx']": {
            'ctrl-c ctrl-f': 'linter-eslint:fix-file'
        }
    }
});

usePackage('prettier-atom', {
    config: {
        useEslint: true,
        formatOnSave: false,
        singleQuote: true,
        printWidth: 100,
        trailingComma: false,
        tabWidth: 4
    }
});

usePackage('language-cshtml');

//
//
// Misc languages

usePackage('linter-jsonlint');
