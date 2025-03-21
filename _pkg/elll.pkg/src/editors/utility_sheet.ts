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

export type UtilitySheetEditorStateData = EditorStateData & {};

export class UtilitySheetEditorState extends EditorState<UtilitySheetEditorStateData> {
  get elll() {
    const elll = this.shell.properties.value<IElll>("elll");
    if (!elll) {
      throw new Error("Elll not found in shell properties");
    }
    return elll;
  }

  get title(): string {
    return "Utilities";
  }
  get title$(): Observable<string> {
    return of("Utilities");
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

  get data(): UtilitySheetEditorStateData {
    return {
      ...super._data,
    };
  }
  get data$(): Observable<UtilitySheetEditorStateData> {
    return combineLatestOrEmpty([super._data$]).pipe(
      map(([superData]) => ({
        ...superData,
      })),
    );
  }

  constructor({ id, shell }: { id?: string; shell: Shell }) {
    super({ id, editorId: editors.utilitySheet, shell });

    this.addAction({
      icon: elllIcons16.plus,
      name: "Add Utility",
      action: () => {
        // const preset = generateTailwindStylePreset();
        // this.project.utilityManager.restore({ sets: preset.utilities });
        // this.project.variableManager.restore({ sets: preset.variables });
      },
    });
  }

  restore(data: UtilitySheetEditorStateData): void {
    super.restore(data);
  }
}

export const utilitySheetEditor: Editor = {
  id: editors.utilitySheet,
  createState: (shell) => new UtilitySheetEditorState({ shell }),
  views: {
    board: boardViews.utilitySheet.id,
  },
};
