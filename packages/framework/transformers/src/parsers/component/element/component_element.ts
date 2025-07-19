import type { ElementData } from "@elllphnt/elementa-base";
import type { Identifier, JsxChild } from "ts-morph";
import { Node } from "ts-morph";
import { resolveImportFromSymbol } from "~/libs/import.js";
import { parseBaseElementNode } from "./base/base_element.js";
import { parseElementsFromNode } from "./element.js";
import { parseLinkElementNode } from "./link_element.js";
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
}): ElementData {
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

  if (
    context.isSystemModule(importData.module, "navigation") &&
    importData.name === "Link"
  ) {
    return parseLinkElementNode({ attributes, children, context });
  } else {
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

    return {
      ...base,
      componentRef: {
        __import: importData,
      },
      content,
      tag: undefined,
    };
  }
}
