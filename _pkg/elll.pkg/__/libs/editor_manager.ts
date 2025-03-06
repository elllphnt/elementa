import { elllFileTypes, fileTypeMatch, getUrlScheme } from "@elllphnt/utils";
import { File } from "@repo/backend";
import { codeEditor } from "../editors/code/code";
import { componentEditor } from "../editors/component/editor";
import { ContentEditorState } from "../editors/content";
import { Elll } from "../elll/elll";
import { mimeTypes } from "./constants/mime_types";

const elementaMimeTypes = [elllFileTypes.components.elll];
const languages = ["json", "typescript", "xml"];
const editorIdForFileType = (fileType: string) => {
  // elementa editor
  if (
    elementaMimeTypes.some((elementaMimeType) =>
      fileTypeMatch(fileType, elementaMimeType),
    )
  ) {
    return componentEditor.id;
  }

  // script editor
  if (languages.some((language) => fileType.endsWith(`+${language}`))) {
    return codeEditor.id;
  }
  if (
    [mimeTypes.css, mimeTypes.html, mimeTypes.json, mimeTypes.text].includes(
      fileType,
    )
  ) {
    return codeEditor.id;
  }
};

export class EditorManager {
  static key = "editor-manager";
  // private previewEditor: PreviewEditorState | null = null;

  readonly elll: Elll;

  constructor({ elll }: { elll: Elll }) {
    this.elll = elll;
  }

  // getPreviewEditor() {
  //   this.elll.shell.toast({
  //     message: "getPreviewEditor",
  //   });
  //   if (!this.previewEditor) {
  //     this.elll.shell.toast({
  //       message: "create new PreviewEditorState",
  //     });

  //     this.previewEditor = new PreviewEditorState({
  //       shell: this.elll.shell,
  //     });
  //     this.elll.shell.toast({
  //       message: "new PreviewEditorState created",
  //     });
  //   }
  //   return this.previewEditor;
  // }

  toCanonicalUrl(url: string) {
    const scheme = getUrlScheme(url);
    switch (scheme) {
      case "elll":
        return url;
      case "elementaentity":
        return url;
      default:
        throw new Error(`Unknown url scheme: ${scheme}`);
    }
  }

  async resolveWorkspaceFileTypeFromUrl(
    url: string,
  ): Promise<string | undefined> {
    return "";
    // const elll = this.elll;
    // const { id } = parseFidUrl(url);
    // const file = elll.workspace?.file(id, true);
    // await file?.untilLoaded();
    // return file?.type;
  }
  async resolveBackendFileTypeFromUrl(
    url: string,
  ): Promise<string | undefined> {
    const elll = this.elll;

    const file = elll.backend.instance<File>(url, true);
    await file?.untilLoaded();
    return file?.type;
  }
  async resolveElementaFileTypeFromUrl(
    url: string,
  ): Promise<string | undefined> {
    const elll = this.elll;
    const file = elll.project.entityFileStore.file(url);
    return file?.type;
  }
  async resolveFileTypeFromUrl(url: string): Promise<string | undefined> {
    const scheme = getUrlScheme(url);
    switch (scheme) {
      case "fid": {
        return this.resolveWorkspaceFileTypeFromUrl(url);
      }
      case "elll": {
        return this.resolveBackendFileTypeFromUrl(url);
      }
      case "elementaentity": {
        return this.resolveElementaFileTypeFromUrl(url);
      }
    }
  }
  async openFile(
    _url: string,
    { preferedEditorId }: { preferedEditorId?: string } = {},
  ) {
    const url = this.toCanonicalUrl(_url);
    const shell = this.elll.shell;
    const workspace = shell.workspace;

    const fileType = await this.resolveFileTypeFromUrl(url);
    if (!fileType) {
      shell.toast({
        message: `File ${url} not found.`,
      });
      return;
    }

    const editorId = preferedEditorId ?? editorIdForFileType(fileType);
    if (!editorId) {
      shell.toast({
        message: `No editor found for file type ${fileType}`,
      });
      return;
    }

    const editor = shell.createEditorState({ editorId });
    if (!editor) {
      shell.toast({
        message: `Editor ${editorId} not found.`,
      });
      return;
    }

    if (!(editor instanceof ContentEditorState)) {
      shell.toast({
        message: `Editor ${editorId} is not a file editor.`,
      });
      return;
    }

    const currentEditor = workspace.editors.find((e) => {
      return (
        e instanceof ContentEditorState &&
        e.url === url &&
        e.editorId === editorId
      );
    });
    if (currentEditor) {
      workspace.activateEditor(currentEditor);
      return;
    }

    editor.setUrl(url);
    workspace.addEditor(editor);
    workspace.activateEditor(editor);
  }
  async openPreview(url?: string) {
    // const previewEditor = this.getPreviewEditor();
    // this.elll.shell.workspace.setFocusedEditor(previewEditor);
  }
}
