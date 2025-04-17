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
import { keys } from "../../libs/keys";
import { IElll } from "../../types/elll";

export type BriefEditorStateData = EditorStateData & {};

export class BriefEditorState extends EditorState<BriefEditorStateData> {
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

  get data(): BriefEditorStateData {
    return {
      ...super._data,
    };
  }
  get data$(): Observable<BriefEditorStateData> {
    return combineLatestOrEmpty([super._data$]).pipe(
      map(([superData]) => ({
        ...superData,
      })),
    );
  }

  constructor({ id, shell }: { id?: string; shell: Shell }) {
    super({ id, editorId: keys.editors.brief, shell });
  }

  restore(data: BriefEditorStateData): void {
    super.restore(data);
  }
}

export const specEditor: Editor = {
  id: keys.editors.brief,
  createState: (shell) => new BriefEditorState({ shell }),
  views: {
    board: keys.views.board.briefEditor,
  },
};
