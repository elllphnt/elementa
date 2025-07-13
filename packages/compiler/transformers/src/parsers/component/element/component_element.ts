import type { ComponentElementData } from "@elllphnt/elementa-base";
import type { Identifier, JsxChild } from "ts-morph";
import { Node } from "ts-morph";
import { resolveImportFromSymbol } from "~/libs/import.js";
import { parseBaseElementNode } from "./base/base_element.js";
import { parseElementsFromNode } from "./element.js";
import type {
  ElementAttributeEntry,
  ParseElementContext,
} from "./utils/types.js";

export function parseComponentElementNode({
  tag,
  attributes,
  children,
  context,
}: {
  tag: Identifier;
  attributes: ElementAttributeEntry[];
  children: JsxChild[];
  context: ParseElementContext;
}): ComponentElementData {
  const base = parseBaseElementNode({
    type: "component",
    attributes,
    context,
  });

  const content = children.flatMap((child) => {
    if (
      Node.isJsxElement(child) ||
      Node.isJsxFragment(child) ||
      Node.isJsxSelfClosingElement(child)
    ) {
      return parseElementsFromNode({
        node: child,
        context,
      });
    }
    return [];
  });

  const symbol = tag
    .getProject()
    .getTypeChecker()
    .getSymbolAtLocation(tag)?.compilerSymbol;
  if (!symbol) {
    throw new Error(`Symbol not found for tag: ${tag.getText()}`);
  }
  const sourceFile = tag.getSourceFile().compilerNode;

  const importData = resolveImportFromSymbol({
    symbol,
    sourceFile,
  });
  if (!importData) {
    throw new Error(`Import data not found for symbol: ${symbol.name}`);
  }

  return {
    ...base,
    component: {
      __import: importData,
    },
    content,
    tag: undefined,
  };
}
