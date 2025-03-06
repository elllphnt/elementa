import { elllIcons16 } from "@repo/components";
import { Context, Editor, Shell } from "@repo/shell";
import { combineLatestOrEmpty } from "@repo/utils";
import { Observable, map, of, switchMap } from "rxjs";
import { formatTypescript } from "~/src/libs/code/format";
import { keys } from "~/src/libs/keys";
import { reactModelConstructor } from "../../models/react";
import { boardViews } from "../../views/board/_";
import { editors } from "../_editors";
import { ModelEditorStateData } from "../model";
import { MonacoEditorState } from "./monaco";

export type ReactEditorStateData = ModelEditorStateData & {};

const reactPreviewContext: Context = {
  id: "elementa.context.react-preview",
  name: "Preview",
  panel: {
    viewId: keys.views.reactPreview,
  },
  icon: elllIcons16.content,
};

export class ReactEditorState extends MonacoEditorState<ReactEditorStateData> {
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

  get data(): ReactEditorStateData {
    return {
      ...super._data,
    };
  }
  get data$(): Observable<ReactEditorStateData> {
    return combineLatestOrEmpty([super._data$]).pipe(
      map(([superData]) => ({
        ...superData,
      })),
    );
  }

  get contexts() {
    return [reactPreviewContext];
  }
  get contexts$() {
    return of([reactPreviewContext]);
  }

  constructor({ id, shell }: { id?: string; shell: Shell }) {
    super({ id, editorId: editors.react, shell });

    // initialize on first load
    this.loaded$.subscribe((loaded) => {
      if (loaded) {
        this.init({
          content: this.content?.data ?? "",
          language: "typescript",
          uri: `file:///${this.id}.tsx`,
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

export const reactEditor: Editor = {
  id: editors.react,
  createState: (shell) => new ReactEditorState({ shell }),
  views: {
    board: boardViews.monacoEditor.id,
  },
};
