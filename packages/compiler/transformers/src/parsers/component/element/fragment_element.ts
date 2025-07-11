import type { ElementData } from "@elllphnt/elementa-base";
import type { JsxFragment } from "ts-morph";
import { Node } from "ts-morph";
import { parseElementsFromNode } from "./element.js";
import type { ParseElementContext } from "./utils/types.js";

export function parseFragmentElementNode({
  node,
  context,
}: {
  node: JsxFragment;
  context: ParseElementContext;
}): ElementData[] {
  const results: ElementData[] = [];
  const children = node.getJsxChildren();
  children.forEach((child) => {
    if (
      Node.isJsxElement(child) ||
      Node.isJsxFragment(child) ||
      Node.isJsxSelfClosingElement(child)
    ) {
      results.push(
        ...parseElementsFromNode({
          node: child,
          context,
        }),
      );
    }
  });
  return results;
}
