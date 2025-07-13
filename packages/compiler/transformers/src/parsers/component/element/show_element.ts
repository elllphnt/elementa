import type { ElementData, Evaluable } from "@elllphnt/elementa-base";
import { genId } from "@elllphnt/elementa-base";
import type { JsxChild } from "ts-morph";
import { parseExpression } from "../misc/expression.js";
import { parseElementsFromNode } from "./element.js";
import type {
  ElementAttributeEntry,
  ParseElementContext,
} from "./utils/types.js";

export function parseShowElementNode({
  attributes,
  children,
  context,
}: {
  attributes: ElementAttributeEntry[];
  children: JsxChild[];
  context: ParseElementContext;
}): ElementData | undefined {
  let condition: Evaluable;

  attributes.forEach((attr) => {
    if (Array.isArray(attr)) {
      const [attrName, value] = attr;
      if (attrName === "condition" && value) {
        condition = parseExpression(value, context.scope);
      }
    }
  });

  const content = children.flatMap((child) => {
    return parseElementsFromNode({
      node: child,
      context,
    });
  });

  if (content.length === 1) {
    return {
      ...content[0],
      condition,
    };
  } else {
    const fragment = context.createFragment({ content });
    return {
      id: genId(),
      type: "fragment",
      fragmentId: fragment.id,
      condition,
    };
  }
}
