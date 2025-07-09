import { parse } from "@babel/parser";
import * as t from "@babel/types";
import type { ElementData } from "@elllphnt/elementa-base";
import type { CreateFragment } from "./_types.js";
import type { GetStylesheet } from "./base_element.js";
import { parseComponentElementNode } from "./component_element.js";
import { parseContainerElementNode } from "./container_element.js";
import { parseElllForElementNode } from "./elll_for_element.js";
import { parseElllShowElementNode } from "./elll_show_element.js";
import { parseFragmentElementNode } from "./fragment_element.js";
import { parseLinkElementNode } from "./link_element.js";
import { parseMediaElementNode } from "./media_element.js";
import { parseMemberExpressionElementNode } from "./member_expression_element.js";
import { parseExpressionContainerNode } from "./misc_elements.js";
import { parseSlotElementNode } from "./slot_element.js";
import { parseJSXTextNode, parseTextElementNode } from "./text_element.js";
import { mediaTags, nativeTags, textTags } from "./utils/html_tags.js";
import { parseVectorElementNode } from "./vector_element.js";
export { parseClassExpression } from "./utils/class_expression.js";
export { extractInnerTextFromElementNode } from "./utils/extract_text.js";

export function parseElementsFromJSX({
  code,
  createFragment,
}: {
  code: string;
  createFragment: CreateFragment;
}): ElementData[] {
  const ast = parse(code, {
    sourceType: "module",
    plugins: ["jsx", "typescript"],
  });
  return extractElementsFromNode({
    node: (ast as any).program,
    createFragment,
  });
}

export function extractElementsFromNode({
  node,
  getStylesheet,
  createFragment,
}: {
  node: t.Node | null | undefined;
  getStylesheet: GetStylesheet;
  createFragment: CreateFragment;
}): ElementData[] {
  if (!node) return [];
  if (t.isJSXElement(node)) {
    const tagNode = node.openingElement.name;
    if (t.isJSXIdentifier(tagNode)) {
      const tagName = tagNode.name;

      // 1) <elll-for> loop handling
      if (tagName === "elll-for") {
        const element = parseElllForElementNode({
          node,
          getStylesheet,
          createFragment,
        });
        return element ? [element] : [];
      }

      // 2) <elll-show> conditional handling
      if (tagName === "elll-show") {
        const element = parseElllShowElementNode({
          node,
          getStylesheet,
          createFragment,
        });
        return element ? [element] : [];
      }

      // 3) Pure "text" tags
      if (textTags.has(tagName)) {
        return [parseTextElementNode({ node, getStylesheet })];
      }
      // 4) Media tags
      if (mediaTags.has(tagName)) {
        return [parseMediaElementNode({ node, getStylesheet })];
      }
      // 5) SVG wrapper
      if (tagName === "svg") {
        return [parseVectorElementNode({ node, getStylesheet })];
      }
      // 6) Slot
      if (tagName === "elll-slot") {
        return [parseSlotElementNode({ node, getStylesheet, createFragment })];
      }
      // 7) Anchor—treat as container for now
      if (tagName === "a") {
        const element = parseLinkElementNode({
          node,
          getStylesheet,
          createFragment,
        });
        return element ? [element] : [];
      }
      // 8) Any other standard HTML tag that's not "text" or "media"
      if (nativeTags.has(tagName)) {
        return [
          parseContainerElementNode({ node, getStylesheet, createFragment }),
        ];
      }
      // 9) Anything else → custom component
      return [
        parseComponentElementNode({
          name: tagName,
          node,
          getStylesheet,
          createFragment,
        }),
      ];
    } else if (t.isJSXMemberExpression(tagNode)) {
      return [parseMemberExpressionElementNode({ node, getStylesheet })];
    } else {
      return [];
    }
  }

  if (t.isJSXFragment(node)) {
    return parseFragmentElementNode({ node, getStylesheet, createFragment });
  }

  if (t.isJSXExpressionContainer(node)) {
    if (t.isJSXEmptyExpression(node.expression)) {
      return [];
    } else {
      return [parseExpressionContainerNode({ node, getStylesheet })];
    }
  }

  if (t.isJSXText(node)) {
    if (node.value.trim()) {
      return [parseJSXTextNode({ node, getStylesheet })];
    } else {
      return [];
    }
  }

  // Otherwise, recurse into children
  const results: ElementData[] = [];
  for (const key of Object.keys(node) as Array<keyof t.Node>) {
    const child = (node as any)[key];
    if (Array.isArray(child)) {
      for (const c of child) {
        if (c && typeof c === "object" && "type" in c) {
          results.push(
            ...extractElementsFromNode({
              node: c,
              getStylesheet,
              createFragment,
            })
          );
        }
      }
    } else if (child && typeof child === "object" && "type" in child) {
      results.push(
        ...extractElementsFromNode({
          node: child,
          getStylesheet,
          createFragment,
        })
      );
    }
  }
  return results;
}
