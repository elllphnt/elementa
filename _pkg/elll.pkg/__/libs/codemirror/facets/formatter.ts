import { Facet } from "@codemirror/state";
import { EditorView } from "@codemirror/view";

export type FormatSource = (view: EditorView) => Promise<void>;

export const formatter = Facet.define<FormatSource, FormatSource>({
  combine: (sources) => async (view) => {
    for (const source of sources) {
      await source(view);
    }
  },
});
