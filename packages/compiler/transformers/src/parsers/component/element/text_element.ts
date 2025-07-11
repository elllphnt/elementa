import type {
  ResolvableOrEvaluable,
  TextElementData,
  TextMarkData,
} from "@elllphnt/elementa-base";
import type { JsxChild } from "ts-morph";
import type { ElementAttributeEntry, ParseElementContext } from "./_types.js";
import { parseBaseElementNode } from "./base/base_element.js";

export function extractTextFromNode(node: t.Node): string {
  if (t.isJSXText(node)) {
    return node.value;
  }
  if (t.isJSXExpressionContainer(node)) {
    const inner = node.expression;
    if (t.isStringLiteral(inner)) {
      return inner.value;
    } else {
      return `{{ ${generateExpressionSource(inner).trim()} }}`;
    }
  }
  if (t.isJSXSpreadChild(node)) {
    const spreadExpr = node.expression;
    return `{{ ...${generateExpressionSource(spreadExpr).trim()} }}`;
  }
  if (t.isJSXElement(node)) {
    return extractInnerTextFromElementNode(node);
  }
  if (t.isJSXFragment(node)) {
    let fragText = "";
    node.children.forEach((child) => {
      fragText += extractTextFromNode(child as t.Node);
    });
    return fragText;
  }
  return "";
}

export function extractInnerTextFromElementNode(node: t.JSXElement): string {
  let result = "";
  node.children.forEach((child) => {
    result += extractTextFromNode(child as t.Node);
  });
  return result;
}

export function parseTextElementNode({
  tag,
  attributes,
  children,
  context,
}: {
  tag: string;
  attributes: ElementAttributeEntry[];
  children: JsxChild[];
  context: ParseElementContext;
}): TextElementData {
  const base = parseBaseElementNode({
    type: "text",
    tag,
    attributes,
    context,
  });

  const rawText = extractInnerTextFromElementNode(node).trim();
  const textField: ResolvableOrEvaluable<string> = rawText;
  const marks: TextMarkData[] = [];

  return {
    ...base,
    text: textField,
    marks,
  };
}
