import { Editor, Shell } from "@repo/shell";
import { combineLatestOrEmpty } from "@repo/utils";
import { Observable, map, of, switchMap } from "rxjs";
import { formatTypescript } from "~/src/libs/code/format";
import { keys } from "~/src/libs/keys";
import { reactModelConstructor } from "../../models/react";
import { ModelEditorStateData } from "../model";
import { MonacoEditorState } from "./monaco";

export type TypescriptEditorStateData = ModelEditorStateData & {};

export class TypescriptEditorState extends MonacoEditorState<TypescriptEditorStateData> {
  modelConstructor = reactModelConstructor.name;

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
      switchMap((model) => model?.content?.data$ ?? of("")),
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

  get data(): TypescriptEditorStateData {
    return {
      ...super._data,
    };
  }
  get data$(): Observable<TypescriptEditorStateData> {
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
    super({ id, editorId: keys.editors.typescript, shell });

    // initialize on first load
    this.loaded$.subscribe((loaded) => {
      if (loaded) {
        this.init({
          content: this.content?.data ?? "",
          language: "typescript",
          uri: `file:///${this.id}.ts`,
        });
      }
    });
  }

  saveContent(content: string): void {
    this.content?.update(content);
  }
  async formatContent(content: string): Promise<string> {
    const result = await formatTypescript({ script: content, cursorOffset: 0 });
    return result.script;
  }
}

export const typescriptEditor: Editor = {
  id: keys.editors.typescript,
  createState: (shell) => new TypescriptEditorState({ shell }),
  views: {
    board: keys.views.board.monacoEditor,
  },
};
