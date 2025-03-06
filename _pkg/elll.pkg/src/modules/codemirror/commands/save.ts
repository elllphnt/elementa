import { Command } from "@codemirror/view";
import { formatter } from "../facets/formatter";
import { saver } from "../facets/saver";

export const save: Command = (view) => {
  // run formatter before saving
  const format = view.state.facet(formatter);
  format(view).then(() => {
    // run saver after formatting
    view.state.facet(saver)(view);
  });

  return true;
};
