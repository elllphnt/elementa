import { type ElementData } from "@elllphnt/elementa-base";
import type { JsxElement, JsxFragment, JsxSelfClosingElement } from "ts-morph";
import { Node } from "ts-morph";
import { parseComponentElementNode } from "./component_element.js";
import { parseContainerElementNode } from "./container_element.js";
import { parseFragmentElementNode } from "./fragment_element.js";
import { parseMediaElementNode } from "./media_element.js";
import { parseTextElementNode } from "./text_element.js";
import { mediaTags, nativeTags, textTags } from "./utils/html_tags.js";
import type {
  ElementAttributeEntry,
  ParseElementContext,
} from "./utils/types.js";
import { parseVectorElementNode } from "./vector_element.js";

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
      return [parseMediaElementNode({ node, context })];
    }
    if (tagName === "svg") {
      return [parseVectorElementNode({ node, context })];
    }
    if (tagName === "a") {
      // For now, treat anchor tags as container elements
      // Link functionality is handled via the link attribute in base elements
      return [parseContainerElementNode({ node, context })];
    }
    if (nativeTags.has(tagName)) {
      return [parseContainerElementNode({ node, context })];
    }
    return [
      parseComponentElementNode({
        name: tagName,
        node,
        context,
      }),
    ];
  } else {
    // Handle complex tag names (like member expressions)
    const tagName = tagNameNode.getText();
    return [
      parseComponentElementNode({
        name: tagName,
        node,
        context,
      }),
    ];
  }
}

function parseElementsFromJsxFragment({
  node,
  context,
}: {
  node: JsxFragment;
  context: ParseElementContext;
}): ElementData[] {
  return parseFragmentElementNode({ node, context });
}

function parseElementsFromJsxSelfClosingElement({
  node,
  context,
}: {
  node: JsxSelfClosingElement;
  context: ParseElementContext;
}): ElementData[] {
  const tagNameNode = node.getTagNameNode();

  // Create an adapter to make self-closing element look like regular element
  const createJsxElementAdapter = (): JsxElement =>
    ({
      getOpeningElement: () => ({
        getTagNameNode: () => tagNameNode,
        getAttributes: () => node.getAttributes(),
      }),
      getJsxChildren: () => [],
    }) as any as JsxElement;

  if (Node.isIdentifier(tagNameNode)) {
    const tagName = tagNameNode.getText();

    if (mediaTags.has(tagName)) {
      return [
        parseMediaElementNode({
          node: createJsxElementAdapter(),
          context,
        }),
      ];
    }
    if (tagName === "svg") {
      return [
        parseVectorElementNode({
          node: createJsxElementAdapter(),
          context,
        }),
      ];
    }
    if (nativeTags.has(tagName)) {
      return [
        parseContainerElementNode({
          node: createJsxElementAdapter(),
          context,
        }),
      ];
    }
    return [
      parseComponentElementNode({
        name: tagName,
        node: createJsxElementAdapter(),
        context,
      }),
    ];
  } else {
    // Handle complex tag names
    const tagName = tagNameNode.getText();
    return [
      parseComponentElementNode({
        name: tagName,
        node: createJsxElementAdapter(),
        context,
      }),
    ];
  }
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
      node: node as JsxFragment,
      context,
    });
  } else if (Node.isJsxSelfClosingElement(node)) {
    return parseElementsFromJsxSelfClosingElement({
      node: node as JsxSelfClosingElement,
      context,
    });
  } else {
    throw new Error(
      `Unsupported JSX node type: ${(node as any).getKindName()}. Expected JsxElement, JsxFragment, or JsxSelfClosingElement.`,
    );
  }
}
