import { File } from "@repo/backend";
import { EditorStateStore } from "@repo/elementa";
import { Disposable } from "@repo/utils";
import { map } from "rxjs";
import { mimeTypes } from "~/src/libs/mimetypes";
import { elllFileAtPath, elllFileAtPath$ } from "../_utils";
import { ElllProject } from "../project";
import { ElllEditorState } from "./editor_state";

const editorStatePath = (type: string, id: string) => {
  return `.elll/editor_states/${type}/${id}.json`;
};

export class ElllEditorStateStore
  extends Disposable
  implements EditorStateStore
{
  readonly project: ElllProject;

  private _editorstates = new Map<File, ElllEditorState>();

  get elll() {
    return this.project.elll;
  }

  editorStateFromFile(file: File): ElllEditorState {
    let editorstate = this._editorstates.get(file);
    if (!editorstate) {
      editorstate = new ElllEditorState({
        file,
        elll: this.elll,
        project: this.project,
      });
      this._editorstates.set(file, editorstate);
    }
    return editorstate;
  }

  editorState(type: string, id: string): ElllEditorState | undefined {
    const file = elllFileAtPath(this.elll, editorStatePath(type, id), {
      type: mimeTypes.json,
    });
    if (file) {
      return this.editorStateFromFile(file);
    } else {
      return undefined;
    }
  }
  editorState$(type: string, id: string) {
    const file$ = elllFileAtPath$(this.elll, editorStatePath(type, id), {
      type: mimeTypes.json,
    });
    return file$.pipe(map((file) => file && this.editorStateFromFile(file)));
  }

  constructor({ project }: { project: ElllProject }) {
    super();
    this.project = project;

    this.addDisposer(() => {
      this._editorstates.forEach((editorstate) => editorstate.dispose());
      this._editorstates.clear();
    });
  }
}
