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
import { keys } from "../libs/keys";
import { ElllElementaProject } from "../modules/elementa/project/project";
import { IElll } from "../types/elll";
import { boardViews } from "../views/board/_";

export type VariableSheetEditorStateData = EditorStateData & {};

export class VariableSheetEditorState extends EditorState<VariableSheetEditorStateData> {
  get elll() {
    const elll = this.shell.properties.value<IElll>("elll");
    if (!elll) {
      throw new Error("Elll not found in shell properties");
    }
    return elll;
  }

  get project() {
    return ElllElementaProject.workspaceProjectOf(this.elll);
  }
  get project$() {
    return ElllElementaProject.workspaceProjectOf$(this.elll);
  }

  get variableSheet() {
    return this.project?.styleManager.variableSheet;
  }
  get variableSheet$() {
    return this.project$.pipe(
      map((project) => project?.styleManager.variableSheet),
    );
  }

  get title(): string {
    return "Variables";
  }
  get title$(): Observable<string> {
    return of("Variables");
  }

  get icon() {
    return {
      name: elllIcons16.variable,
      color: "",
    };
  }
  get icon$() {
    return of({
      name: elllIcons16.variable,
      color: "",
    });
  }

  get contexts(): Context[] {
    return [];
  }
  get contexts$(): Observable<Context[]> {
    return of([]);
  }

  get data(): VariableSheetEditorStateData {
    return {
      ...super._data,
    };
  }
  get data$(): Observable<VariableSheetEditorStateData> {
    return combineLatestOrEmpty([super._data$]).pipe(
      map(([superData]) => ({
        ...superData,
      })),
    );
  }

  constructor({ id, shell }: { id?: string; shell: Shell }) {
    super({ id, editorId: keys.editors.variableSheet, shell });
  }

  restore(data: VariableSheetEditorStateData): void {}
}

export const variableSheetEditor: Editor = {
  id: keys.editors.variableSheet,
  createState: (shell) => new VariableSheetEditorState({ shell }),
  views: {
    board: boardViews.variableSheet.id,
  },
};
