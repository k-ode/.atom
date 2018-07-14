'use babel';

import {usePackage, configSet} from 'atom-use-package';

//
//
// General options

configSet('core', {
    autoHideMenuBar: true,
    disabledPackages: ['background-tips', 'tabs'],
    openEmptyEditorOnStart: false,
    restorePreviousWindowsOnStart: 'no',
    themes: ['city-lights-ui', 'city-lights-syntax']
});

configSet('editor', {
    tabLength: 4,
    softWrap: false,
    tabType: 'soft',
    preferredLineLength: 100
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

atom.keymaps.add(__filename, {
    'atom-workspace atom-text-editor:not([mini])': {
        "ctrl-alt-'": 'editor:split-selections-into-lines',
        'ctrl-a': 'editor:move-to-first-character-of-line',
        'ctrl-e': 'editor:move-to-end-of-line',
        'ctrl-up': 'editor:move-to-beginning-of-previous-paragraph',
        'ctrl-down': 'editor:move-to-beginning-of-next-paragraph',
        'ctrl-shift-up': 'editor:select-to-beginning-of-previous-paragraph',
        'ctrl-shift-down': 'editor:select-to-beginning-of-next-paragraph'
    },
    'atom-workspace atom-text-editor': {
        'ctrl-left': 'editor:emacs-move-subword-left',
        'ctrl-right': 'editor:emacs-move-subword-right',
        'ctrl-shift-left': 'editor:emacs-select-subword-left',
        'ctrl-shift-right': 'editor:emacs-select-subword-right',
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
        'alt--': 'core:redo'
    }
});

//
//
// Packages

usePackage('disable-keybindings', {
    config: {
        allBundledPackages: true,
        allCommunityPackages: true,
        exceptCommunityPackages: [],
        prefixKeys: ['ctrl-k']
    }
});

// usePackage("base16-syntax");
// usePackage('file-icons');

// usePackage("monokai", {
//   init: () => {
//     atom.config.set("core.themes", ["atom-dark-ui", "monokai"]);
//   }
// });

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

usePackage('emacs-plus', {
    enableKeys: true
});

usePackage('emacs-tab', {
    enableKeys: true
});

// usePackage("organized", {
//   enableKeys: true,
//   config: {
//     enableToolbarSupport: false
//   }
// });

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
        autoActivationDelay: 1000,
        backspaceTriggersAutocomplete: true,
        confirmCompletion: 'tab always, enter when suggestion explicitly selected',
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
// usePackage("atom-oss-license");
usePackage('undo-tree');

// usePackage("project-jump", {
//   keymap: {
//     "atom-workspace": {
//       "ctrl-x p a": "project-jump:add",
//       "ctrl-x p o": "project-jump:open",
//       "ctrl-x p p": "project-jump:switch",
//       "ctrl-x p r": "project-jump:remove"
//     }
//   }
// });

// usePackage("file-watcher", {
//   config: {
//     autoReload: true
//   }
// });

// usePackage("docblockr", {
//   enableKeys: true
// });

// usePackage("atom-beautify", {
//   keymap: {
//     "atom-workspace atom-text-editor": {
//       "ctrl-c ctrl-f": "beautify-editor"
//     }
//   }
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
            // "alt-n": "diagnostics:go-to-next-diagnostic",
            // "alt-p": "diagnostics:go-to-previous-diagnostic",
            // "ctrl-c s": "diagnostics:show-actions-at-position",
            // "ctrl-c alt-s": "diagnostics:fix-all-in-current-file",
            // "ctrl-c r": "find-references:activate",
            // "ctrl-t": "datatip:toggle",
            // "alt-.": "hyperclick:confirm-cursor"
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
// Rust
//
// configSet(
//   "editor",
//   {
//     preferredLineLength: 80
//   },
//   {scopeSelector: ".rust.source"}
// );
//
// usePackage("ide-rust", {
//   config: {
//     rlsToolchain: "nightly",
//     rlsDefaultConfig: {
//       allTargets: "On",
//       clippyPreference: "On"
//     }
//   }
// });
//
// usePackage("build-cargo");
//
// usePackage("autocomplete-crates");
// // usePackage("rustsym");

//
//
// JavaScript

usePackage('language-babel');

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

//
//
// PureScript

// usePackage("language-purescript");
//
// usePackage("ide-purescript", {
//   enableKeys: true
// });

//
//
// Misc languages

usePackage('linter-jsonlint');
// usePackage("language-papyrus");
// usePackage("language-stellaris");
