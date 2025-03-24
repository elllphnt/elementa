import { elllIcons16 } from "@repo/components";
import {
  Context,
  Editor,
  EditorState,
  EditorStateData,
  Shell,
} from "@repo/shell";
import { combineLatestOrEmpty } from "@repo/utils";
import { Observable, map, of } from "rxjs";
import { IElll } from "../types/elll";
import { editors } from "./_editors";
import { keys } from "../libs/keys";

export type ProgrammingInterfaceEditorStateData = EditorStateData & {};

export class ProgrammingInterfaceEditorState extends EditorState<ProgrammingInterfaceEditorStateData> {
  get elll() {
    const elll = this.shell.properties.value<IElll>("elll");
    if (!elll) {
      throw new Error("Elll not found in shell properties");
    }
    return elll;
  }

  get title(): string {
    return "Programming Interface";
  }
  get title$(): Observable<string> {
    return of("Programming Interface");
  }

  get icon() {
    return {
      name: elllIcons16.script,
      color: "",
    };
  }
  get icon$() {
    return of({
      name: elllIcons16.script,
      color: "",
    });
  }

  get contexts(): Context[] {
    return [];
  }
  get contexts$(): Observable<Context[]> {
    return of([]);
  }

  get data(): ProgrammingInterfaceEditorStateData {
    return {
      ...super._data,
    };
  }
  get data$(): Observable<ProgrammingInterfaceEditorStateData> {
    return combineLatestOrEmpty([super._data$]).pipe(
      map(([superData]) => ({
        ...superData,
      })),
    );
  }

  constructor({ id, shell }: { id?: string; shell: Shell }) {
    super({ id, editorId: editors.programmingInterface, shell });
  }

  restore(data: ProgrammingInterfaceEditorStateData): void {
    super.restore(data);
  }
}

export const programmingInterfaceEditor: Editor = {
  id: editors.programmingInterface,
  createState: (shell) => new ProgrammingInterfaceEditorState({ shell }),
  views: {
    board: keys.views.board.programmingInterfaceEditor,
  },
};
