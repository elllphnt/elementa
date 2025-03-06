import { hoverTooltip } from "@codemirror/view";
import { quickInfoHoverSource } from "./source";

export function quickInfo() {
  return hoverTooltip(quickInfoHoverSource);
}
