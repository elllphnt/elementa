import type { ElementData, Evaluable } from "@elllphnt/elementa-base";
import type { Identifier, JsxChild } from "ts-morph";
import { Node } from "ts-morph";
import { resolveImportFromSymbol } from "~/libs/import.js";
import { parseExpression } from "../misc/expression.js";
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

    // Every other attribute is a prop of the child component
    // (`<Card title="…" count={n} featured />`). `id`/`className` style the
    // element itself and `on*` handlers become interactions (see
    // parseBaseElementNode); `key` is React-only.
    const props: Record<string, Evaluable> = {};
    for (const attr of attributes) {
      if (!Array.isArray(attr)) continue; // spread attributes stay raw
      const [name, value] = attr;
      if (name === "id" || name === "className" || name === "key") continue;
      if (name.startsWith("on")) continue;
      props[name] = value ? parseExpression(value, context.scope) : true;
    }

    return {
      ...base,
      componentRef: {
        __import: importData,
      },
      props,
      content,
      tag: undefined,
    };
  }
}
