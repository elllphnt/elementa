import { genId, type ElementData } from "@elllphnt/elementa-base";
import type {
  Identifier,
  JsxChild,
  JsxElement,
  JsxFragment,
  JsxSelfClosingElement,
} from "ts-morph";
import { Node } from "ts-morph";
import { parseComponentElementNode } from "./component_element.js";
import { parseContainerElementNode } from "./container_element.js";
import { parseLinkElementNode } from "./link_element.js";
import { parseMediaElementNode } from "./media_element.js";
import { parseTextElementNode } from "./text_element.js";
import { mediaTags, nativeTags, textTags } from "./utils/html_tags.js";
import { trimHtmlText } from "./utils/text.js";
import type {
  ElementAttributeEntry,
  ParseElementContext,
} from "./utils/types.js";
import { parseVectorElementNode } from "./vector_element.js";

function parseElement({
  tag: tagNode,
  attributes,
  children,
  context,
}: {
  tag: Identifier;
  attributes: ElementAttributeEntry[];
  children: JsxChild[];
  context: ParseElementContext;
}): ElementData {
  const tagName = tagNode.getText();

  if (textTags.has(tagName)) {
    return parseTextElementNode({
      tag: tagNode,
      attributes,
      children,
      context,
    });
  }
  if (mediaTags.has(tagName)) {
    return parseMediaElementNode({
      tag: tagNode,
      attributes,
      context,
    });
  }
  if (tagName === "svg") {
    return parseVectorElementNode({
      tag: tagNode,
      attributes,
      children,
      context,
    });
  }
  if (tagName === "navlink" || tagName === "a") {
    return parseLinkElementNode({
      attributes,
      children,
      context,
    });
  }
  if (nativeTags.has(tagName)) {
    return parseContainerElementNode({
      tag: tagNode,
      attributes,
      children,
      context,
    });
  }
  return parseComponentElementNode({
    tag: tagNode,
    attributes,
    children,
    context,
  });
}

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
        const name = attr.getNameNode();
        if (Node.isIdentifier(name)) {
          const initializer = attr.getInitializer();
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
    return [
      parseElement({
        tag: tagNameNode,
        attributes,
        children,
        context,
      }),
    ];
  } else {
    throw new Error(
      `Expected identifier for tag name, got ${tagNameNode.getKindName()}`,
    );
  }
}

function parseElementsFromJsxFragment({
  node,
  context,
}: {
  node: JsxFragment;
  context: ParseElementContext;
}): ElementData[] {
  const children = node.getJsxChildren();
  return children.flatMap((child) => {
    return parseElementsFromNode({
      node: child,
      context,
    });
  });
}

function parseElementsFromJsxSelfClosingElement({
  node,
  context,
}: {
  node: JsxSelfClosingElement;
  context: ParseElementContext;
}): ElementData[] {
  const tagNameNode = node.getTagNameNode();
  const attributes: ElementAttributeEntry[] = node
    .getAttributes()
    .map((attr) => {
      if (Node.isJsxAttribute(attr)) {
        const name = attr.getNameNode();
        if (Node.isIdentifier(name)) {
          const initializer = attr.getInitializer();
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

  if (Node.isIdentifier(tagNameNode)) {
    return [
      parseElement({
        tag: tagNameNode,
        attributes,
        children: [],
        context,
      }),
    ];
  } else {
    throw new Error(
      `Expected identifier for tag name, got ${tagNameNode.getKindName()}`,
    );
  }
}

export function parseElementsFromNode({
  node,
  context,
}: {
  node: JsxChild;
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
  } else if (Node.isJsxText(node)) {
    const text = node.getText();
    if (text) {
      return [
        {
          id: genId(),
          type: "text",
          text: trimHtmlText(text),
        },
      ];
    } else {
      return [];
    }
  } else if (Node.isJsxExpression(node)) {
    const expr = node.getExpression();
    if (expr) {
      return [
        {
          id: genId(),
          type: "expression",
          expression: expr.getText(),
        },
      ];
    } else {
      return [];
    }
  } else {
    throw new Error(
      `Unsupported JSX node type: ${(node as any).getKindName()}. Expected JsxElement, JsxFragment, or JsxSelfClosingElement.`,
    );
  }
}
