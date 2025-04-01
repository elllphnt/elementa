import { Editor, Shell } from "@repo/shell";
import { combineLatestOrEmpty } from "@repo/utils";
import { Observable, map, of, switchMap } from "rxjs";
import { keys } from "~/src/libs/keys";
import { jsonModelConstructor } from "../../models/json";
import { ModelEditorStateData } from "../model";
import { MonacoEditorState } from "./monaco";

export type JsonEditorStateData = ModelEditorStateData & {};

export class JsonEditorState extends MonacoEditorState<JsonEditorStateData> {
  modelConstructor = jsonModelConstructor.name;

  get content() {
    return this.model?.content;
  }
  get content$() {
    return this.model$.pipe(map((model) => model?.content));
  }

  get contentData() {
    return this.model?.content?.data ?? {};
  }
  get contentData$() {
    return this.model$.pipe(
      switchMap((model) => model?.content?.data$ ?? of({})),
    );
  }

  get loaded() {
    return this.model?.content?.loaded;
  }
  get loaded$() {
    return this.model$.pipe(
      switchMap((model) => model?.content?.loaded$ ?? of(false)),
    );
  }

  get data(): JsonEditorStateData {
    return {
      ...super._data,
    };
  }
  get data$(): Observable<JsonEditorStateData> {
    return combineLatestOrEmpty([super._data$]).pipe(
      map(([superData]) => ({
        ...superData,
      })),
    );
  }

  get contexts() {
    return [];
  }
  get contexts$() {
    return of([]);
  }

  constructor({ id, shell }: { id?: string; shell: Shell }) {
    super({ id, editorId: keys.editors.json, shell });

    // initialize on first load
    this.loaded$.subscribe((loaded) => {
      if (loaded) {
        this.init({
          content: JSON.stringify(this.contentData ?? [], null, 2),
          language: "json",
          uri: `file:///${this.id}.json`,
        });
      }
    });

    // update model on content change
    this.contentData$.subscribe((content) => {
      this.textModel?.setValue(JSON.stringify(content ?? {}, null, 2));
    });
  }

  saveContent(content: string): void {
    this.model?.content?.update(JSON.parse(content));
  }
  formatContent(content: string): Promise<string> | string {
    return JSON.stringify(JSON.parse(content), null, 2);
  }
}

export const jsonEditor: Editor = {
  id: keys.editors.json,
  createState: (shell) => new JsonEditorState({ shell }),
  views: {
    board: keys.views.board.monacoEditor,
  },
};
