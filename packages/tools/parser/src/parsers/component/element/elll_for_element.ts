import * as t from "@babel/types";
import type { ElementData, ElementRepeatData } from "@elllphnt/elementa-base";
import { genId } from "../utils.js";
import type { CreateFragment } from "./_types.js";
import type { GetStylesheet } from "./base_element.js";
import { extractElementsFromNode } from "./element.js";
import { generateExpressionSource } from "./utils/generate.js";

export function parseElllForElementNode({
  node,
  getStylesheet,
  createFragment,
}: {
  node: t.JSXElement;
  getStylesheet: GetStylesheet;
  createFragment: CreateFragment;
}): ElementData | undefined {
  // Build our repeat payload by reading "data", "as", and optional "index".
  const repeatData: ElementRepeatData = {};
  let asVar: string | undefined;
  let indexVar: string | undefined;

  node.openingElement.attributes.forEach((attr) => {
    if (!t.isJSXAttribute(attr)) return;
    const attrName = attr.name.name as string;

    // <elll-for data={items} ...>
    if (attrName === "data" && attr.value) {
      if (t.isStringLiteral(attr.value)) {
        try {
          // Try parsing a JSON literal
          const parsed = JSON.parse(attr.value.value);
          repeatData.dataset =
            parsed as unknown as ElementRepeatData["dataset"];
        } catch {
          // Fallback: treat raw string as an expression container later
          repeatData.dataset = {
            __expression: attr.value.value,
          } as unknown as ElementRepeatData["dataset"];
        }
      } else if (t.isJSXExpressionContainer(attr.value)) {
        const expr = attr.value.expression;
        repeatData.dataset = {
          __expression: generateExpressionSource(expr),
        } as unknown as ElementRepeatData["dataset"];
      }
    }

    // <elll-for as="item" ...>
    if (attrName === "as" && attr.value) {
      if (t.isStringLiteral(attr.value)) {
        asVar = attr.value.value;
      } else if (t.isJSXExpressionContainer(attr.value)) {
        const expr = attr.value.expression;
        if (t.isStringLiteral(expr)) {
          asVar = expr.value;
        }
      }
    }

    // <elll-for index="i" ...> (optional)
    if (attrName === "index" && attr.value) {
      if (t.isStringLiteral(attr.value)) {
        indexVar = attr.value.value;
      } else if (t.isJSXExpressionContainer(attr.value)) {
        const expr = attr.value.expression;
        if (t.isStringLiteral(expr)) {
          indexVar = expr.value;
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
    const fragment = createFragment({ content: childrenElements });
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
