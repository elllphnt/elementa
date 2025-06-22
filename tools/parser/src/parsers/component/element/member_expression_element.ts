import * as t from "@babel/types";
import { ElementData } from "@elllphnt/elementa-base";
import { GetStylesheet, parseBaseElementNode } from "./base_element.js";
import { genId } from "../utils.js";

function memberExpressionToString(expr: t.JSXMemberExpression): string {
  const object = expr.object;
  const property = expr.property;
  const objectName = t.isJSXIdentifier(object)
    ? object.name
    : memberExpressionToString(object as t.JSXMemberExpression);
  return `${objectName}.${property.name}`;
}

export function parseMemberExpressionElementNode({
  node,
  getStylesheet,
}: {
  node: t.JSXElement;
  getStylesheet: GetStylesheet;
}): ElementData {
  // First, parse base element properties (id, attributes, styles, children, etc.)
  const base = parseBaseElementNode({
    type: "component",
    node,
    getStylesheet,
  });

  // Determine the full tag name from a JSXMemberExpression
  let fullTagName: string | undefined;
  const tagNode = node.openingElement.name;
  if (t.isJSXMemberExpression(tagNode)) {
    fullTagName = memberExpressionToString(tagNode);
  } else if (t.isJSXIdentifier(tagNode)) {
    fullTagName = tagNode.name;
  }

  return {
    ...base,
    id: genId(),
    type: "component",
    tag: fullTagName,
  };
}
