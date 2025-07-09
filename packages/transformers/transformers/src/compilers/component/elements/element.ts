import type { ElementData } from "@elllphnt/elementa-base";
import * as ts from "typescript";
import { compileComponentElement } from "./component_new.js";
import { compileContainerElement } from "./container.js";
import {
  compileExpressionElement,
  compileFragmentElement,
  compileMediaElement,
  compilePrimitiveElement,
  compileVectorElement,
} from "./simple_elements.js";
import { compileSlotElement } from "./slot_new.js";
import { compileTextElement } from "./text.js";

export function compileElement(
  data: ElementData
): ts.JsxElement | ts.JsxText | ts.JsxExpression | ts.JsxFragment {
  if (typeof data === "string") {
    return ts.factory.createJsxText(data, false);
  }

  // Handle different element types based on the existing transpiler patterns
  switch (data.type) {
    case "container":
      return compileContainerElement(data);
    case "text":
      return compileTextElement(data);
    case "component":
      return compileComponentElement(data);
    case "slot":
      return compileSlotElement(data);
    case "primitive":
      return compilePrimitiveElement(data);
    case "media":
      return compileMediaElement(data);
    case "vector":
      return compileVectorElement(data);
    case "fragment":
      return compileFragmentElement(data);
    case "expression":
      return compileExpressionElement(data);
    default:
      // Fallback to a div
      return ts.factory.createJsxElement(
        ts.factory.createJsxOpeningElement(
          ts.factory.createIdentifier("div"),
          undefined,
          ts.factory.createJsxAttributes([])
        ),
        [],
        ts.factory.createJsxClosingElement(ts.factory.createIdentifier("div"))
      );
  }
}
