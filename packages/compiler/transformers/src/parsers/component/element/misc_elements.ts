import type { ElementData } from "@elllphnt/elementa-base";
import { genId } from "@elllphnt/elementa-base";
import type { JsxExpression } from "ts-morph";

export function parseExpressionContainerNode({
  node,
}: {
  node: JsxExpression;
}): ElementData {
  const expression = node.getExpression()?.getText() || "";

  return {
    id: genId(),
    type: "expression",
    expression,
  };
}
