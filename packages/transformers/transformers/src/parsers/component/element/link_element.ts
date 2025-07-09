import * as t from "@babel/types";
import type {
  ElementData,
  LinkData,
  ResolvableOrEvaluable,
} from "@elllphnt/elementa-base";
import { genId } from "@elllphnt/elementa-base";
import type { CreateFragment } from "./_types.js";
import type { GetStylesheet } from "./base_element.js";
import { extractElementsFromNode } from "./element.js";
import { generateExpressionSource } from "./utils/generate.js";

export function parseLinkElementNode({
  node,
  getStylesheet,
  createFragment,
}: {
  node: t.JSXElement;
  getStylesheet: GetStylesheet;
  createFragment: CreateFragment;
}): ElementData | undefined {
  // Build our link payload (always type "href")
  const linkData: LinkData = { type: "href" };

  node.openingElement.attributes.forEach((attr) => {
    if (!t.isJSXAttribute(attr)) return;
    const attrName = attr.name.name as string;

    // <a href="..." or href={expr}>
    if (attrName === "href" && attr.value) {
      if (t.isStringLiteral(attr.value)) {
        linkData.href = attr.value
          .value as unknown as ResolvableOrEvaluable<string>;
      } else if (t.isJSXExpressionContainer(attr.value)) {
        const expr = attr.value.expression;
        linkData.href = {
          __expression: generateExpressionSource(expr),
        } as ResolvableOrEvaluable<string>;
      }
    }

    // <a target="..." or target={expr}>
    if (attrName === "target" && attr.value) {
      if (t.isStringLiteral(attr.value)) {
        linkData.target = attr.value
          .value as unknown as ResolvableOrEvaluable<string>;
      } else if (t.isJSXExpressionContainer(attr.value)) {
        const expr = attr.value.expression;
        linkData.target = {
          __expression: generateExpressionSource(expr),
        } as ResolvableOrEvaluable<string>;
      }
    }

    // <a rel="..." or rel={expr}>
    if (attrName === "rel" && attr.value) {
      if (t.isStringLiteral(attr.value)) {
        linkData.rel = attr.value
          .value as unknown as ResolvableOrEvaluable<string>;
      } else if (t.isJSXExpressionContainer(attr.value)) {
        const expr = attr.value.expression;
        linkData.rel = {
          __expression: generateExpressionSource(expr),
        } as ResolvableOrEvaluable<string>;
      }
    }

    // <a hreflang="..." or hreflang={expr}>
    if (attrName === "hreflang" && attr.value) {
      if (t.isStringLiteral(attr.value)) {
        linkData.hreflang = attr.value
          .value as unknown as ResolvableOrEvaluable<string>;
      } else if (t.isJSXExpressionContainer(attr.value)) {
        const expr = attr.value.expression;
        linkData.hreflang = {
          __expression: generateExpressionSource(expr),
        } as ResolvableOrEvaluable<string>;
      }
    }

    // <a ping="[...] " or ping={expr}>
    if (attrName === "ping" && attr.value) {
      if (t.isStringLiteral(attr.value)) {
        try {
          const parsed = JSON.parse(attr.value.value);
          linkData.ping = parsed as unknown as ResolvableOrEvaluable<string[]>;
        } catch {
          linkData.ping = {
            __expression: attr.value.value,
          } as unknown as ResolvableOrEvaluable<string[]>;
        }
      } else if (t.isJSXExpressionContainer(attr.value)) {
        const expr = attr.value.expression;
        linkData.ping = {
          __expression: generateExpressionSource(expr),
        } as ResolvableOrEvaluable<string[]>;
      }
    }

    // <a referrerPolicy="..." or referrerPolicy={expr}>
    if (attrName === "referrerPolicy" && attr.value) {
      if (t.isStringLiteral(attr.value)) {
        linkData.referrerPolicy = attr.value
          .value as unknown as ResolvableOrEvaluable<string>;
      } else if (t.isJSXExpressionContainer(attr.value)) {
        const expr = attr.value.expression;
        linkData.referrerPolicy = {
          __expression: generateExpressionSource(expr),
        } as ResolvableOrEvaluable<string>;
      }
    }
  });

  // Extract all child elements (flattening fragments as needed).
  const childrenElements: ElementData[] = [];
  node.children.forEach((child) => {
    const parsedChildren = extractElementsFromNode({
      node: child as t.Node,
      getStylesheet,
      createFragment,
    });
    parsedChildren.forEach((el) => childrenElements.push(el));
  });

  // If there’s exactly one element inside <a>, attach link there.
  if (childrenElements.length === 1) {
    const singleEl = childrenElements[0] as ElementData & { link?: LinkData };
    singleEl.link = linkData;
    return singleEl;
  }

  // If multiple children, wrap them in a fragment and attach link to that fragment.
  if (childrenElements.length > 1) {
    const fragment = createFragment({ content: childrenElements });
    return {
      id: genId(),
      type: "fragment",
      fragmentId: fragment.id,
      link: linkData,
    };
  }

  // No valid children → nothing to return.
  return undefined;
}
