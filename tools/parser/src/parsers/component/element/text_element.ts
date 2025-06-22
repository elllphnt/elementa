import * as t from "@babel/types";
import {
  ResolvableOrEvaluable,
  TextElementData,
  TextMarkData,
} from "@elllphnt/elementa-base";
import { genId } from "../utils.js";
import { GetStylesheet, parseBaseElementNode } from "./base_element.js";
import { extractInnerTextFromElementNode } from "./utils/extract_text.js";

export function parseTextElementNode({
  node,
  getStylesheet,
}: {
  node: t.JSXElement;
  getStylesheet: GetStylesheet;
}): TextElementData {
  const base = parseBaseElementNode({
    type: "text",
    node,
    getStylesheet,
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

export function parseJSXTextNode({
  node,
}: {
  node: t.JSXText;
  getStylesheet: GetStylesheet;
}): TextElementData {
  const raw = node.value.trim();
  const textField: ResolvableOrEvaluable<string> = raw;
  return {
    id: genId(),
    type: "text",
    text: textField,
  };
}
