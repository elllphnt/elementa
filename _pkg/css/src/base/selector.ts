import { CssSelector } from "@elllphnt/elementa-base";
import { CssStyleData } from "./types.js";

export const baseSelector = "__base__";

export function applySelectedCssStyle({
  target,
  selector,
  style,
}: {
  target: CssStyleData;
  selector: CssSelector;
  style: CssStyleData;
}) {
  let targetStyle = target;

  for (const key of selector) {
    if (!targetStyle[key]) {
      targetStyle[key] = {};
    }
    targetStyle = targetStyle[key] as CssStyleData;
  }

  for (const [property, value] of Object.entries(style)) {
    targetStyle[property] = value;
  }
}

export function normalizeSelector(selector: CssSelector): CssSelector {
  const order = ["@layer", "@media", "@supports", "@container"];

  return selector.slice().sort((a, b) => {
    const indexA = order.findIndex((prefix) => a.startsWith(prefix));
    const indexB = order.findIndex((prefix) => b.startsWith(prefix));

    if (indexA === -1 && indexB === -1) return 0;
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });
}
