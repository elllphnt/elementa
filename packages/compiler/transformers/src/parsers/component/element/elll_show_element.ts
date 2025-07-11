import type {
  ConditionalData,
  ElementData,
  ResolvableOrEvaluable,
} from "@elllphnt/elementa-base";
import { genId } from "@elllphnt/elementa-base";
import type { JsxElement } from "ts-morph";
import { Node } from "ts-morph";
import { parseElementsFromNode } from "./element.js";
import type { ParseElementContext } from "./utils/types.js";

export function parseElllShowElementNode({
  node,
  context,
}: {
  node: JsxElement;
  context: ParseElementContext;
}): ElementData | undefined {
  // Build our conditional payload by reading "when"
  const condData: ConditionalData = {};
  const attributes = node.getOpeningElement().getAttributes();
  attributes.forEach((attr) => {
    if (!Node.isJsxAttribute(attr)) return;
    const nameNode = attr.getNameNode();
    if (!Node.isIdentifier(nameNode)) return;
    const attrName = nameNode.getText();

    // <elll-show when={...}>
    if (attrName === "when") {
      const value = attr.getInitializer();
      if (value && Node.isStringLiteral(value)) {
        const val = value.getLiteralValue().trim().toLowerCase();
        if (val === "true" || val === "false") {
          condData.condition = val === "true";
        }
      } else if (value && Node.isJsxExpression(value)) {
        const expr = value.getExpression();
        if (expr && Node.isBooleanKeyword(expr)) {
          condData.condition = expr.getText() === "true";
        } else if (expr) {
          condData.condition = {
            __expression: (expr as any).getText(),
          };
        }
      }
    }
  });

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

  // If there’s exactly one element inside <elll-show>, attach condition there.
  if (childrenElements.length === 1) {
    const singleEl = childrenElements[0] as ElementData & {
      condition?: ResolvableOrEvaluable<boolean>;
    };
    singleEl.condition = condData.condition;
    return singleEl;
  }

  // If multiple children, wrap them in a fragment, then attach condition to that fragment.
  if (childrenElements.length > 1) {
    const fragment = context.createFragment({ content: childrenElements });
    // The returned fragment element should accept a "repeat" field.
    return {
      id: genId(),
      type: "fragment",
      fragmentId: fragment.id,
      condition: condData.condition,
    };
  }
}
