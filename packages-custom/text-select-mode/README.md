# text-select-mode package

Enables text selection mode for the active editor, where every move command behaves like the corresponding select command.
Inspired by emacs' transient-mark-mode, but using only basic text selection features.

The package does not add a keybinding. Be sure to add your own to your keymap.cson:

```
'atom-workspace atom-text-editor':
  "ctrl-space": "text-select-mode:toggle"
```

The toggle command will alternatively activate/deactivate text select mode on the current editor.

Upon activation, any move command will behave like a select command. Copying, cutting, pasting or deleting text will cancel select mode. The cancel command will also deactivate the mode.

Upon deactivation, move commands behave like normal. Current selections either remain (default) or not based on settings.

![A screenshot of your package](https://f.cloud.github.com/assets/69169/2290250/c35d867a-a017-11e3-86be-cd7c5bf3ff9b.gif)
