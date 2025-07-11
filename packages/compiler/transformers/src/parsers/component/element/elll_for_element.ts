import type { ElementData, ElementRepeatData } from "@elllphnt/elementa-base";
import { genId } from "@elllphnt/elementa-base";
import type { JsxElement } from "ts-morph";
import { Node } from "ts-morph";
import { parseElementsFromNode } from "./element.js";
import type { ParseElementContext } from "./utils/types.js";

export function parseElllForElementNode({
  node,
  context,
}: {
  node: JsxElement;
  context: ParseElementContext;
}): ElementData | undefined {
  // Build our repeat payload by reading "data", "as", and optional "index".
  const repeatData: ElementRepeatData = {};
  let asVar: string | undefined;
  let indexVar: string | undefined;

  const attributes = node.getOpeningElement().getAttributes();
  attributes.forEach((attr) => {
    if (!Node.isJsxAttribute(attr)) return;
    const nameNode = attr.getNameNode();
    if (!Node.isIdentifier(nameNode)) return;
    const attrName = nameNode.getText();

    // <elll-for data={items} ...>
    if (attrName === "data") {
      const value = attr.getInitializer();
      if (value && Node.isStringLiteral(value)) {
        try {
          // Try parsing a JSON literal
          const parsed = JSON.parse(value.getLiteralValue());
          repeatData.dataset =
            parsed as unknown as ElementRepeatData["dataset"];
        } catch {
          // Fallback: treat raw string as an expression container later
          repeatData.dataset = {
            __expression: value.getLiteralValue(),
          } as unknown as ElementRepeatData["dataset"];
        }
      } else if (value && Node.isJsxExpression(value)) {
        const expr = value.getExpression();
        if (expr) {
          repeatData.dataset = {
            __expression: expr.getText(),
          } as unknown as ElementRepeatData["dataset"];
        }
      }
    }

    // <elll-for as="item" ...>
    if (attrName === "as") {
      const value = attr.getInitializer();
      if (value && Node.isStringLiteral(value)) {
        asVar = value.getLiteralValue();
      } else if (value && Node.isJsxExpression(value)) {
        const expr = value.getExpression();
        if (expr && Node.isStringLiteral(expr)) {
          asVar = expr.getLiteralValue();
        }
      }
    }

    // <elll-for index="i" ...> (optional)
    if (attrName === "index") {
      const value = attr.getInitializer();
      if (value && Node.isStringLiteral(value)) {
        indexVar = value.getLiteralValue();
      } else if (value && Node.isJsxExpression(value)) {
        const expr = value.getExpression();
        if (expr && Node.isStringLiteral(expr)) {
          indexVar = expr.getLiteralValue();
        }
      }
    }
  });

  // Stash the "as" and "index" names onto repeatData using the new alias fields.
  if (asVar) {
    repeatData.alias = asVar;
  }
  if (indexVar) {
    repeatData.indexAlias = indexVar;
  }

  // Extract all child elements (flattening fragments as needed).
  const childrenElements: ElementData[] = [];
  const children = node.getJsxChildren();
  children.forEach((child) => {
    if (
      Node.isJsxElement(child) ||
      Node.isJsxFragment(child) ||
      Node.isJsxSelfClosingElement(child)
    ) {
      const parsedChildren = parseElementsFromNode({
        node: child,
        context,
      });
      parsedChildren.forEach((el) => childrenElements.push(el));
    }
  });

  // If there’s exactly one element inside <elll-for>, attach repeat there.
  if (childrenElements.length === 1) {
    const singleEl = childrenElements[0] as ElementData & {
      repeat?: ElementRepeatData;
    };
    singleEl.repeat = repeatData;
    return singleEl;
  }

  // If multiple children, wrap them in a fragment, then attach repeat to that fragment.
  if (childrenElements.length > 1) {
    const fragment = context.createFragment({ content: childrenElements });
    // The returned fragment element should accept a "repeat" field.
    return {
      id: genId(),
      type: "fragment",
      fragmentId: fragment.id,
      repeat: repeatData,
    };
  }

  // No valid children → nothing to repeat.
  return undefined;
}
