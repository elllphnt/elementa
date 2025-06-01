import * as t from "@babel/types";
import {
  ResolvableOrEvaluable,
  VectorElementData,
  VectorElementNodeData,
  VectorNodeData,
  VectorTextNodeData,
} from "@elllphnt/elementa-base";
import { GetStylesheet, parseBaseElementNode } from "./base_element.js";
import { generateExpressionSource } from "./utils/generate.js";

export function parseVectorElementNode({
  node,
  getStylesheet,
}: {
  node: t.JSXElement;
  getStylesheet: GetStylesheet;
}): VectorElementData {
  const base = parseBaseElementNode({
    type: "vector",
    node,
    getStylesheet,
  });

  // Extract top‐level SVG attributes
  let width: ResolvableOrEvaluable<string | number> | undefined;
  let height: ResolvableOrEvaluable<string | number> | undefined;
  let viewBox: ResolvableOrEvaluable<string> | undefined;
  let preserveAspectRatio: ResolvableOrEvaluable<string> | undefined;

  node.openingElement.attributes.forEach((attr) => {
    if (!t.isJSXAttribute(attr)) return;
    const name = attr.name.name as string;
    const valueNode = attr.value;
    if (!valueNode) return;

    // width
    if (name === "width") {
      if (t.isStringLiteral(valueNode)) {
        width = valueNode.value;
      } else if (t.isJSXExpressionContainer(valueNode)) {
        width = {
          __expression: generateExpressionSource(valueNode.expression),
        } as ResolvableOrEvaluable<string | number>;
      }
      return;
    }

    // height
    if (name === "height") {
      if (t.isStringLiteral(valueNode)) {
        height = valueNode.value;
      } else if (t.isJSXExpressionContainer(valueNode)) {
        height = {
          __expression: generateExpressionSource(valueNode.expression),
        } as ResolvableOrEvaluable<string | number>;
      }
      return;
    }

    // viewBox
    if (name === "viewBox") {
      if (t.isStringLiteral(valueNode)) {
        viewBox = valueNode.value;
      } else if (t.isJSXExpressionContainer(valueNode)) {
        viewBox = {
          __expression: generateExpressionSource(valueNode.expression),
        } as ResolvableOrEvaluable<string>;
      }
      return;
    }

    // preserveAspectRatio
    if (name === "preserveAspectRatio") {
      if (t.isStringLiteral(valueNode)) {
        preserveAspectRatio = valueNode.value;
      } else if (t.isJSXExpressionContainer(valueNode)) {
        preserveAspectRatio = {
          __expression: generateExpressionSource(valueNode.expression),
        } as ResolvableOrEvaluable<string>;
      }
      return;
    }
  });

  // Recursive helper to parse any VectorNode (text or element)
  function parseVectorNode(node: t.Node): VectorNodeData | null {
    // Text node
    if (t.isJSXText(node)) {
      const text = node.value;
      const trimmed = text.replace(/\s+/g, " ");
      if (trimmed.trim() === "") return null;
      const data: VectorTextNodeData = {
        type: "text",
        value: trimmed,
      };
      return data;
    }

    // Element node (e.g., <rect ...>...</rect>)
    if (t.isJSXElement(node)) {
      const tag = node.openingElement.name;
      let tagName: string;
      if (t.isJSXIdentifier(tag)) {
        tagName = tag.name;
      } else if (t.isJSXMemberExpression(tag)) {
        // e.g. <svg:g>
        tagName = `${(tag.object as t.JSXIdentifier).name}:${
          (tag.property as t.JSXIdentifier).name
        }`;
      } else {
        return null;
      }

      // Collect properties
      const props: Record<string, any> = {};
      node.openingElement.attributes.forEach((attr) => {
        if (!t.isJSXAttribute(attr)) return;
        const attrName = attr.name.name as string;
        const valNode = attr.value;
        if (!valNode) {
          // Boolean attribute without value
          props[attrName] = true;
          return;
        }
        if (t.isStringLiteral(valNode)) {
          props[attrName] = valNode.value;
        } else if (t.isJSXExpressionContainer(valNode)) {
          const expr = valNode.expression;
          if (
            t.isStringLiteral(expr) ||
            t.isNumericLiteral(expr) ||
            t.isBooleanLiteral(expr)
          ) {
            props[attrName] = expr.value;
          } else {
            props[attrName] = {
              __expression: generateExpressionSource(expr),
            };
          }
        }
      });

      // Recurse into children
      const childNodes: VectorNodeData[] = [];
      node.children.forEach((child) => {
        const parsed = parseVectorNode(child);
        if (parsed) childNodes.push(parsed);
      });

      const elemData: VectorElementNodeData = {
        type: "element",
        tagName,
        properties: Object.keys(props).length ? props : undefined,
        children: childNodes,
      };
      return elemData;
    }

    // Other node types (e.g., JSXFragment) are ignored for vector
    return null;
  }

  // Parse all children of the root <svg>
  const content: VectorNodeData[] = [];
  node.children.forEach((child) => {
    const parsed = parseVectorNode(child);
    if (parsed) content.push(parsed);
  });

  return {
    ...base,
    width,
    height,
    viewBox,
    preserveAspectRatio,
    content: content.length ? content : undefined,
  } as VectorElementData;
}
