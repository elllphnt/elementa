import { type ElementData } from "@elllphnt/elementa-base";
import type { JsxElement, JsxFragment, JsxSelfClosingElement } from "ts-morph";
import { Node } from "ts-morph";
import type { ElementAttributeEntry, ParseElementContext } from "./_types.js";
import { parseTextElementNode } from "./text_element.js";
import { mediaTags, nativeTags, textTags } from "./utils/html_tags.js";
export { parseClassExpression } from "./utils/class_expression.js";
export { extractInnerTextFromElementNode } from "./utils/extract_text.js";

function parseElementsFromJsxElement({
  node,
  context,
}: {
  node: JsxElement;
  context: ParseElementContext;
}): ElementData[] {
  const openingElement = node.getOpeningElement();
  const tagNameNode = openingElement.getTagNameNode();
  const attributes: ElementAttributeEntry[] = openingElement
    .getAttributes()
    .map((attr) => {
      if (Node.isJsxAttribute(attr)) {
        const name = attr.getNameNode(); // ✅ safe now
        if (Node.isIdentifier(name)) {
          const initializer = attr.getInitializer(); // ✅ safe now
          return [name.getText(), initializer] as const;
        } else {
          throw new Error(
            `Expected identifier for attribute name, got ${name.getKindName()}`,
          );
        }
      } else {
        const expression = attr.getExpression();
        return expression;
      }
    });
  const children = node.getJsxChildren();

  if (Node.isIdentifier(tagNameNode)) {
    const tagName = tagNameNode.getText();

    if (textTags.has(tagName)) {
      return [
        parseTextElementNode({
          tag: tagName,
          attributes,
          children,
          context,
        }),
      ];
    }
    if (mediaTags.has(tagName)) {
      return [parseMediaElementNode({ node, getStylesheet })];
    }
    if (tagName === "svg") {
      return [parseVectorElementNode({ node, getStylesheet })];
    }
    if (tagName === "a") {
      const element = parseLinkElementNode({
        node,
        getStylesheet,
        createFragment,
      });
      return element ? [element] : [];
    }
    if (nativeTags.has(tagName)) {
      return [
        parseContainerElementNode({ node, getStylesheet, createFragment }),
      ];
    }
    return [
      parseComponentElementNode({
        name: tagName,
        node,
        getStylesheet,
        createFragment,
      }),
    ];
  } else {
    return [
      parseComponentElementNode({
        name: tagName,
        node,
        getStylesheet,
        createFragment,
      }),
    ];
  }
}

function parseElementsFromJsxFragment({
  node,
  context,
}: {
  node: Node;
  context: ParseElementContext;
}): ElementData[] {
  // return parseFragmentElementNode({ node, getStylesheet, createFragment });
  return [];
}

function parseElementsFromJsxSelfClosingElement({
  node,
  context,
}: {
  node: Node;
  context: ParseElementContext;
}): ElementData[] {
  return [];
}

export function parseElementsFromNode({
  node,
  context,
}: {
  node: JsxElement | JsxFragment | JsxSelfClosingElement;
  context: ParseElementContext;
}): ElementData[] {
  if (Node.isJsxElement(node)) {
    return parseElementsFromJsxElement({
      node: node as JsxElement,
      context,
    });
  } else if (Node.isJsxFragment(node)) {
    return parseElementsFromJsxFragment({
      node,
      context,
    });
  } else if (Node.isJsxSelfClosingElement(node)) {
    return parseElementsFromJsxSelfClosingElement({
      node,
      context,
    });
  } else {
    throw new Error(
      `Unsupported JSX node type: ${(node as any).getKindName()}. Expected JsxElement, JsxFragment, or JsxSelfClosingElement.`,
    );
  }
}
