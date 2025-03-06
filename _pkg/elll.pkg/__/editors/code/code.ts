import { EditorView } from "@codemirror/view";
import { Editor, Shell } from "@repo/shell";
import { combineLatestOrEmpty } from "@repo/utils";
import { Observable, map } from "rxjs";
import { createCodeMirrorEditor } from "../../libs/codemirror/editor";
import { TSVirtualFileSystem } from "../../libs/typescript/tsvfs";
import { editorViews } from "../../views/editors/_";
import { ContentEditorState, ContentEditorStateData } from "../content";

const editorId = "elll.editor.content.code";

export type CodeEditorStateData = ContentEditorStateData & {};

export class CodeEditorState extends ContentEditorState<CodeEditorStateData> {
  readonly view: EditorView;

  get data(): CodeEditorStateData {
    return {
      ...super._data,
    };
  }
  get data$(): Observable<CodeEditorStateData> {
    return combineLatestOrEmpty([super._data$]).pipe(
      map(([superData]) => ({
        ...superData,
      })),
    );
  }

  get tsvfs() {
    return this.elll.properties.value<TSVirtualFileSystem>(
      TSVirtualFileSystem.key,
    );
  }

  constructor({ id, shell }: { id?: string; shell: Shell }) {
    super({ id, editorId, shell });

    this.view = createCodeMirrorEditor({
      elll: this.elll,
      getFile: () => this.file,
    });

    const contentSubscription = this.fileText$.subscribe((text) => {
      if (!this.view.hasFocus) {
        this.view.dispatch({
          changes: {
            from: 0,
            to: this.view.state.doc.length,
            insert: text ?? "",
          },
        });
      }
    });

    this.addDisposer(() => {
      contentSubscription.unsubscribe();
    });
  }
}

export const codeEditor: Editor = {
  id: editorId,
  createState: (shell) => new CodeEditorState({ shell }),
  views: {
    board: editorViews.scriptBoard.id,
  },
};
