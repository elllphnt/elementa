import { getUrlScheme } from "@elllphnt/utils";
import { EditorState } from "@repo/shell";
import { ModelEditorState } from "~/src/editors/model";
import { IElll } from "~/src/types/elll";

export class EditorManager {
  static key = "editor-manager";

  readonly elll: IElll;

  constructor({ elll }: { elll: IElll }) {
    this.elll = elll;
  }

  toStandardUrl(url: string) {
    const scheme = getUrlScheme(url);
    switch (scheme) {
      case "elll":
        return url;
      default:
        throw new Error(`Unknown url scheme: ${scheme}`);
    }
  }

  async openModel(editorId: string, url: string) {
    try {
      const workspace = this.elll.shell.workspace;
      if (!workspace) {
        this.elll.shell.toast("No active workspace.");
        return;
      }
      const standardUrl = this.toStandardUrl(url);

      // check if an editor for this url already exists
      const existingEditor = workspace.editors.find(
        (editor) =>
          editor.editorId === editorId &&
          editor instanceof ModelEditorState &&
          editor.url === standardUrl,
      );
      if (existingEditor) {
        workspace.activateEditor(existingEditor);
        return;
      }

      // if not, create a new editor
      const editor = this.elll.shell.createEditorState({ editorId }) as
        | ModelEditorState
        | undefined;
      if (!editor) {
        this.elll.shell.toast("Failed to create editor.");
        return;
      }

      editor.setUrl(standardUrl);
      workspace.addEditor(editor);
      workspace.activateEditor(editor);
    } catch (e) {
      this.elll.shell.toast(`Failed to open ${url}.`);
    }
  }
  async openEditor(editorId: string) {
    try {
      const workspace = this.elll.shell.workspace;
      if (!workspace) {
        this.elll.shell.toast("No active workspace.");
        return;
      }

      // check if this editor already exists
      const existingEditor = workspace.editors.find(
        (editor) => editor.editorId === editorId,
      );
      if (existingEditor) {
        workspace.activateEditor(existingEditor);
        return;
      }

      // if not, create a new editor
      const editor = this.elll.shell.createEditorState({ editorId }) as
        | ModelEditorState
        | undefined;
      if (!editor) {
        this.elll.shell.toast("Failed to create editor.");
        return;
      }

      workspace.addEditor(editor);
      workspace.activateEditor(editor);
    } catch (e) {
      this.elll.shell.toast(`Failed to open editor.`);
    }
  }
  async focusedEditor(editor: EditorState) {
    this.elll.shell.workspace?.setFocusedEditor(editor);
  }
}
