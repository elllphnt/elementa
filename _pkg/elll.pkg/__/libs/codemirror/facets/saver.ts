import { Facet } from "@codemirror/state";
import { EditorView } from "@codemirror/view";

export type SaveSource = (view: EditorView) => Promise<void>;

export const saver = Facet.define<SaveSource, SaveSource>({
  combine: (sources) => async (view) => {
    await Promise.all(sources.map((source) => source(view)));
  },
});
