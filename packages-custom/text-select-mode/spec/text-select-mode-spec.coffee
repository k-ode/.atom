TransientMark = require '../lib/text-select-mode'

describe "TextSelectMode", ->
  [editor, editorView] = []
  open = false

  toggleAndRun = (callback) ->
    activationPromise = atom.packages.activatePackage('text-select-mode')
    atom.commands.dispatch editorView, 'text-select-mode:toggle'
    waitsForPromise -> activationPromise
    runs -> callback()

  toggle = ->
    toggleAndRun(->)

  # Have something open in an active editor
  beforeEach ->
    waitsForPromise -> atom.workspace.open('sample.txt')
    runs ->
      editor = atom.workspace.getActiveTextEditor()
      editorView = atom.views.getView(editor)

  describe "when inactive", ->
    it "activates on toggle", ->
      toggleAndRun ->
        expect(atom.packages.isPackageActive("text-select-mode")).toBe(true)

  describe "when active", ->
    describe "and toggled off", ->
      describe "and toggling", ->
        it "toggles on for active text editor", ->
          toggleAndRun ->
            expect(editorView.classList.contains("text-select-mode")).toBe(true)

      describe "and working with the editor", ->
        describe "and moving around", ->
          it "does not interfere with move behaviour", ->
            atom.commands.dispatch editorView, 'core:move-right'
            expect(editor.getCursorBufferPosition().row).toBe(0)
            expect(editor.getCursorBufferPosition().column).toBe(1)
            expect(editor.getSelectedText()).toBe("")

    describe "and toggled on", ->
      beforeEach ->
         toggle()

      describe "and toggling", ->
        describe "and delete selection on cancel is on", ->
          it "cancels selection", ->
            atom.config.set('text-select-mode.clearSelection', true)
            atom.commands.dispatch editorView, 'core:move-right'
            toggle()
            expect(editor.getSelectedText()).toBe("")

        describe "and delete selection on cancel is off", ->
          it "does not cancel selection", ->
            atom.config.set('text-select-mode.clearSelection', false)
            atom.commands.dispatch editorView, 'core:move-right'
            toggle()
            expect(editor.getSelectedText()).toBe("L")

        it "toggles off for active text editor", ->
            expect(editorView.classList.contains("text-select-mode")).toBe(true)
            toggle()
            expect(editorView.classList.contains("text-select-mode")).toBe(false)


      describe "and working with the editor", ->
        it "toggles off on cancel", ->
            expect(editorView.classList.contains("text-select-mode")).toBe(true)
            atom.commands.dispatch editorView, 'core:cancel'
            expect(editorView.classList.contains("text-select-mode")).toBe(false)

        it "toggles off on copy", ->
            expect(editorView.classList.contains("text-select-mode")).toBe(true)
            atom.commands.dispatch editorView, 'core:copy'
            expect(editorView.classList.contains("text-select-mode")).toBe(false)

        it "toggles off on cut", ->
            expect(editorView.classList.contains("text-select-mode")).toBe(true)
            atom.commands.dispatch editorView, 'core:cut'
            expect(editorView.classList.contains("text-select-mode")).toBe(false)

        it "toggles off on paste", ->
            expect(editorView.classList.contains("text-select-mode")).toBe(true)
            atom.commands.dispatch editorView, 'core:paste'
            expect(editorView.classList.contains("text-select-mode")).toBe(false)

        it "toggles off on delete", ->
            expect(editorView.classList.contains("text-select-mode")).toBe(true)
            atom.commands.dispatch editorView, 'core:delete'
            expect(editorView.classList.contains("text-select-mode")).toBe(false)

        describe "and moving around", ->
          it "selects instead of moving", ->
            atom.commands.dispatch editorView, 'core:move-right'
            expect(editor.getCursorBufferPosition().row).toBe(0)
            expect(editor.getCursorBufferPosition().column).toBe(1)
            expect(editor.getSelectedText()).toBe("L")

          it "and works with end command", ->
            toggle()
            atom.commands.dispatch editorView, 'editor:move-to-end-of-screen-line'
            atom.commands.dispatch editorView, 'core:move-left'
            toggle()
            atom.commands.dispatch editorView, 'editor:move-to-end-of-screen-line'
            expect(editor.getCursorBufferPosition().row).toBe(0)
            expect(editor.getCursorBufferPosition().column).toBe(123)
            expect(editor.getSelectedText()).toBe(".")
