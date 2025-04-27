import { CssSelector } from "@elllphnt/elementa-base";

export const baseSelector = "__base__";

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
