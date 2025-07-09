import type { TextElementData } from "@elllphnt/elementa-base";
import * as ts from "typescript";
import { compileElementAttributes } from "./_base_new.js";

const expressionRegex = /\{\{([^}]*\}?[^}]*)\}\}/g;

export function compileTextElement(data: TextElementData): ts.JsxElement {
  const tag = data.tag || "span";
  const attributes = compileElementAttributes(data);

  // Handle text content with expression interpolation
  let textContent: ts.JsxChild;
  if (typeof data.text === "string") {
    // Handle {{expression}} interpolation similar to the existing implementation
    if (expressionRegex.test(data.text)) {
      // Create JSX expression for interpolated text
      const processedText = data.text.replace(expressionRegex, "${$1}");
      textContent = ts.factory.createJsxExpression(
        undefined,
        ts.factory.createTemplateExpression(
          ts.factory.createTemplateHead(processedText),
          []
        )
      );
    } else {
      textContent = ts.factory.createJsxText(data.text, false);
    }
  } else {
    // Dynamic text - convert to string expression
    textContent = ts.factory.createJsxExpression(
      undefined,
      ts.factory.createIdentifier("String(props.text || '')")
    );
  }

  return ts.factory.createJsxElement(
    ts.factory.createJsxOpeningElement(
      ts.factory.createIdentifier(tag),
      undefined,
      ts.factory.createJsxAttributes(attributes)
    ),
    [textContent],
    ts.factory.createJsxClosingElement(ts.factory.createIdentifier(tag))
  );
}
