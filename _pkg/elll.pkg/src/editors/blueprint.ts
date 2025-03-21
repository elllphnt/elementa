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

export type BlueprintEditorStateData = EditorStateData & {};

export class BlueprintEditorState extends EditorState<BlueprintEditorStateData> {
  get elll() {
    const elll = this.shell.properties.value<IElll>("elll");
    if (!elll) {
      throw new Error("Elll not found in shell properties");
    }
    return elll;
  }

  get title(): string {
    return "Blueprint";
  }
  get title$(): Observable<string> {
    return of("Blueprint");
  }

  get icon() {
    return {
      name: elllIcons16.stylesheet,
      color: "",
    };
  }
  get icon$() {
    return of({
      name: elllIcons16.stylesheet,
      color: "",
    });
  }

  get contexts(): Context[] {
    return [];
  }
  get contexts$(): Observable<Context[]> {
    return of([]);
  }

  get data(): BlueprintEditorStateData {
    return {
      ...super._data,
    };
  }
  get data$(): Observable<BlueprintEditorStateData> {
    return combineLatestOrEmpty([super._data$]).pipe(
      map(([superData]) => ({
        ...superData,
      })),
    );
  }

  constructor({ id, shell }: { id?: string; shell: Shell }) {
    super({ id, editorId: editors.bleuprint, shell });
  }

  restore(data: BlueprintEditorStateData): void {
    super.restore(data);
  }
}

export const blueprintEditor: Editor = {
  id: editors.bleuprint,
  createState: (shell) => new BlueprintEditorState({ shell }),
  views: {
    board: boardViews.blueprintEditor.id,
  },
};
