import type * as t from "@babel/types";
import type { ElementData } from "@elllphnt/elementa-base";
import { genId } from "@elllphnt/elementa-base";
import type { GetStylesheet } from "./base_element.js";
import { generate } from "./utils/generate.js";

export function parseExpressionContainerNode({
  node,
}: {
  node: t.JSXExpressionContainer;
  getStylesheet: GetStylesheet;
}): ElementData {
  const expression = generate(node.expression).code;

  return {
    id: genId(),
    type: "expression",
    expression,
  };
}
