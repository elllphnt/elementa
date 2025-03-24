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
import { boardViews } from "../views/board/_";
import { editors } from "./_editors";
import { keys } from "../libs/keys";

export type SpecEditorStateData = EditorStateData & {};

export class SpecEditorState extends EditorState<SpecEditorStateData> {
  get elll() {
    const elll = this.shell.properties.value<IElll>("elll");
    if (!elll) {
      throw new Error("Elll not found in shell properties");
    }
    return elll;
  }

  get title(): string {
    return "Features";
  }
  get title$(): Observable<string> {
    return of("Features");
  }

  get icon() {
    return {
      name: elllIcons16.ai,
      color: "",
    };
  }
  get icon$() {
    return of({
      name: elllIcons16.ai,
      color: "",
    });
  }

  get contexts(): Context[] {
    return [];
  }
  get contexts$(): Observable<Context[]> {
    return of([]);
  }

  get data(): SpecEditorStateData {
    return {
      ...super._data,
    };
  }
  get data$(): Observable<SpecEditorStateData> {
    return combineLatestOrEmpty([super._data$]).pipe(
      map(([superData]) => ({
        ...superData,
      })),
    );
  }

  constructor({ id, shell }: { id?: string; shell: Shell }) {
    super({ id, editorId: editors.spec, shell });
  }

  restore(data: SpecEditorStateData): void {
    super.restore(data);
  }
}

export const specEditor: Editor = {
  id: editors.spec,
  createState: (shell) => new SpecEditorState({ shell }),
  views: {
    board: keys.views.board.featuresEditor,
  },
};
