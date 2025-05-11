import {
  ContainerElementData,
  ElementData,
  ElementStyleData,
  entityTypes,
  TextElementData,
} from "@elllphnt/elll-element";
import { Node, NodeType } from "figma-api";
import { getStyleDataForNode } from "./style_data_for_tag.js";

function convertFigmaNodeToBaseElllElement({
  node,
  type,
}: {
  type: string;
  node: Node;
}): ElementData {
  const baseStyle = getStyleDataForNode(node);
  const style: ElementStyleData = {};

  for (const key in baseStyle) {
    const value = (baseStyle as any)[key];
    if (value !== undefined) {
      (style as any)[key] = {
        __contextMap: {
          __base: value,
        },
      };
    }
  }

  return {
    type,
    name: node.name,
    style,
  };
}
function convertFigmaNodeToContainerElllElement(
  node:
    | Node<"DOCUMENT">
    | Node<"CANVAS">
    | Node<"FRAME">
    | Node<"GROUP">
    | Node<"COMPONENT">
    | Node<"COMPONENT_SET">
    | Node<"INSTANCE">
): ContainerElementData {
  const element = convertFigmaNodeToBaseElllElement({
    type: entityTypes.elements.container,
    node,
  }) as ContainerElementData;
  element.children = node.children
    .map(convertFigmaNodeToElllElement)
    .filter((child): child is ElementData => !!child);
  return element;
}

function converFigmaDocumentElllElement(node: Node<"DOCUMENT">) {
  return convertFigmaNodeToContainerElllElement(node);
}
function converFigmaCanvasElllElement(node: Node<"CANVAS">) {
  return convertFigmaNodeToContainerElllElement(node);
}
function converFigmaFrameElllElement(node: Node<"FRAME">) {
  return convertFigmaNodeToContainerElllElement(node);
}
function converFigmaGroupElllElement(node: Node<"GROUP">) {
  return convertFigmaNodeToContainerElllElement(node);
}
function converFigmaVectorElllElement(node: Node<"VECTOR">) {
  return convertFigmaNodeToBaseElllElement({
    type: entityTypes.elements.vector,
    node,
  });
}
function converFigmaBooleanElllElement(node: Node<"BOOLEAN">) {
  return convertFigmaNodeToBaseElllElement({
    type: entityTypes.elements.container,
    node,
  });
}
function converFigmaBooleanOperationElllElement(
  node: Node<"BOOLEAN_OPERATION">
) {
  return convertFigmaNodeToBaseElllElement({
    type: entityTypes.elements.container,
    node,
  });
}
function converFigmaStarElllElement(node: Node<"STAR">) {
  return convertFigmaNodeToBaseElllElement({
    type: entityTypes.elements.vector,
    node,
  });
}
function converFigmaLineElllElement(node: Node<"LINE">) {
  return convertFigmaNodeToBaseElllElement({
    type: entityTypes.elements.vector,
    node,
  });
}
function converFigmaEllipseElllElement(node: Node<"ELLIPSE">) {
  return convertFigmaNodeToBaseElllElement({
    type: entityTypes.elements.vector,
    node,
  });
}
function converFigmaRegularPolygonElllElement(node: Node<"REGULAR_POLYGON">) {
  return convertFigmaNodeToBaseElllElement({
    type: entityTypes.elements.vector,
    node,
  });
}
function converFigmaRectangleElllElement(node: Node<"RECTANGLE">) {
  return convertFigmaNodeToBaseElllElement({
    type: entityTypes.elements.container,
    node,
  });
}
function converFigmaTextElllElement(node: Node<"TEXT">) {
  const element = convertFigmaNodeToBaseElllElement({
    type: entityTypes.elements.text,
    node,
  }) as TextElementData;
  element.content = {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: node.characters,
          },
        ],
      },
    ],
  };
  return element;
}
function converFigmaSliceElllElement(node: Node<"SLICE">) {
  return convertFigmaNodeToBaseElllElement({
    type: entityTypes.elements.container,
    node,
  });
}
function converFigmaComponentElllElement(node: Node<"COMPONENT">) {
  return convertFigmaNodeToContainerElllElement(node);
}
function converFigmaComponentSetElllElement(node: Node<"COMPONENT_SET">) {
  return convertFigmaNodeToContainerElllElement(node);
}
function converFigmaInstanceElllElement(node: Node<"INSTANCE">) {
  return convertFigmaNodeToContainerElllElement(node);
}

const figmaToElllConverterMap: Record<
  NodeType,
  (node: Node<any>) => ElementData
> = {
  DOCUMENT: converFigmaDocumentElllElement,
  CANVAS: converFigmaCanvasElllElement,
  FRAME: converFigmaFrameElllElement,
  GROUP: converFigmaGroupElllElement,
  VECTOR: converFigmaVectorElllElement,
  BOOLEAN: converFigmaBooleanElllElement,
  BOOLEAN_OPERATION: converFigmaBooleanOperationElllElement,
  STAR: converFigmaStarElllElement,
  LINE: converFigmaLineElllElement,
  ELLIPSE: converFigmaEllipseElllElement,
  REGULAR_POLYGON: converFigmaRegularPolygonElllElement,
  RECTANGLE: converFigmaRectangleElllElement,
  TEXT: converFigmaTextElllElement,
  SLICE: converFigmaSliceElllElement,
  COMPONENT: converFigmaComponentElllElement,
  COMPONENT_SET: converFigmaComponentSetElllElement,
  INSTANCE: converFigmaInstanceElllElement,
};

// Main conversion function
export function convertFigmaNodeToElllElement(
  node: Node
): ElementData | undefined {
  const converter = figmaToElllConverterMap[node.type];
  if (!converter) {
    return undefined;
  }
  return converter(node);
}
