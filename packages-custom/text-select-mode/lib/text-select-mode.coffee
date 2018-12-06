{CompositeDisposable} = require 'atom'

module.exports = TextSelectMode =
  subscriptions: null

  config:
    clearSelection:
      type: 'boolean'
      default: false
      title: 'Clear selection on cancel'
      description: 'When enabled this will clear selections on cancel commands'

  activate: (state) ->
    @subscriptions = new CompositeDisposable
    @subscriptions.add atom.commands.add 'atom-text-editor', 'text-select-mode:toggle': => @toggle()
    @replaceCommands({
      "core:move-up": null,
      "core:move-down": null,
      "core:move-left": null,
      "core:move-right": null,
      "core:move-to-top": null,
      "core:move-to-bottom": null,
      "core:page-up": "core:select-page-up",
      "core:page-down": "core:select-page-down",
      "editor:move-to-first-character-of-line": null,
      "editor:move-to-beginning-of-line": null,
      "editor:move-to-beginning-of-word": null,
      "editor:move-to-beginning-of-next-word": null,
      "editor:move-to-beginning-of-next-paragraph": null,
      "editor:move-to-beginning-of-previous-paragraph": null,
      "editor:move-to-end-of-line": null,
      "editor:move-to-end-of-screen-line": "editor:select-to-end-of-line",
      "editor:move-to-end-of-word": null,
      "editor:move-to-previous-word-boundary": null,
      "editor:move-to-previous-subword-boundary": null,
      "editor:move-to-next-word-boundary": null,
      "editor:move-to-next-subword-boundary": null,
      "editor:emacs-move-subword-left": null,
      "editor:emacs-move-subword-right": null
    })

    @deleteAndCancel([
      "core:delete",
      "core:backspace"
    ])

    @subscribeCancelCommands([
        "core:cancel",
        "core:copy",
        "core:cut",
        "core:paste",
        "emacs-plus:kill-region",
        "emacs-plus:copy"
      ])

  deactivate: ->
    @cancel()
    @subscriptions.dispose()

  serialize: ->

  # Transform a list of "move" commands each into the corresponding "select" command
  replaceCommands: (commands) ->
    for command, selectionCommand of commands
      if selectionCommand == null
        newCommand = command.replace("move", "select")
      else
        newCommand = selectionCommand
      @replaceCommand(command, newCommand)

  # Stop propagation of original command and dispatch the new one
  # Only for text-select-mode text editors
  replaceCommand: (command, newCommand) ->
    binding = {}
    binding[command] = (event) ->
      editor = atom.workspace.getActiveTextEditor()
      atom.commands.dispatch(atom.views.getView(editor), newCommand)
      event.stopImmediatePropagation()

    @subscriptions.add atom.commands.add 'atom-text-editor.text-select-mode', binding

  # Add the effect of cancelling text-select-mode in the active editor for the given commands
  subscribeCancelCommands: (commands) ->
    commands.forEach (command) =>
      binding = {}
      binding[command] = (event) =>
        @cancel()

      @subscriptions.add atom.commands.add 'atom-text-editor.text-select-mode', binding

  deleteAndCancel: (commands) ->
    commands.forEach (command) =>
      binding = {}
      binding[command] = (event) =>
        editor = atom.workspace.getActiveTextEditor()
        editor.selections.forEach (selection) -> selection.deleteSelectedText()
        @cancel()
        event.stopImmediatePropagation()

      @subscriptions.add atom.commands.add 'atom-text-editor.text-select-mode', binding


  toggle: ->
    editor = atom.workspace.getActiveTextEditor()
    view = atom.views.getView(editor)

    if view.classList.contains('text-select-mode')
      @cancel()
    else
      view.classList.add "text-select-mode"


  cancel: ->
    editor = atom.workspace.getActiveTextEditor()
    view = atom.views.getView(editor)

    if atom.config.get('text-select-mode.clearSelection')
      editor.selections.forEach (selection) -> selection.clear()

    view.classList.remove "text-select-mode"
