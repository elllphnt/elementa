import * as t from "@babel/types";
import {
  ConditionalData,
  ElementData,
  ResolvableOrEvaluable,
} from "@elllphnt/elementa-base";
import { genId } from "../utils.js";
import { CreateFragment } from "./_types.js";
import { GetStylesheet } from "./base_element.js";
import { extractElementsFromNode } from "./element.js";
import { generateExpressionSource } from "./utils/generate.js";

export function parseElllShowElementNode({
  node,
  getStylesheet,
  createFragment,
}: {
  node: t.JSXElement;
  getStylesheet: GetStylesheet;
  createFragment: CreateFragment;
}): ElementData | undefined {
  // Build our conditional payload by reading "when"
  const condData: ConditionalData = {};
  node.openingElement.attributes.forEach((attr) => {
    if (!t.isJSXAttribute(attr)) return;
    const attrName = attr.name.name as string;

    // <elll-show when={...}>
    if (attrName === "when" && attr.value) {
      if (t.isStringLiteral(attr.value)) {
        const val = attr.value.value.trim().toLowerCase();
        if (val === "true" || val === "false") {
          condData.condition = val === "true";
        }
      } else if (t.isJSXExpressionContainer(attr.value)) {
        const expr = attr.value.expression;
        if (t.isBooleanLiteral(expr)) {
          condData.condition = expr.value;
        } else {
          condData.condition = {
            __expression: generateExpressionSource(expr),
          };
        }
      }
    }
  });

  // Extract all child elements (flattening fragments as needed).
  const childrenElements: ElementData[] = [];
  node.children.forEach((child) => {
    if (t.isJSXElement(child) || t.isJSXFragment(child)) {
      const parsedChildren = extractElementsFromNode({
        node: child as t.Node,
        getStylesheet,
        createFragment,
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
    const fragment = createFragment({ content: childrenElements });
    // The returned fragment element should accept a "repeat" field.
    return {
      id: genId(),
      type: "fragment",
      fragmentId: fragment.id,
      condition: condData.condition,
    };
  }
}
