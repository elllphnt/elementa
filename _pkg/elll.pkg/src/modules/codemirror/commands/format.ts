import { Command } from "@codemirror/view";
import { formatter } from "../facets/formatter";

export const format: Command = (view) => {
  view.state.facet(formatter)(view);
  return true;
};
