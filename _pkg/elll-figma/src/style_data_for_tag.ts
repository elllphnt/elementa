import { ColorData, FillData, StyleData } from "@elllphnt/elll-element";
import { Node, Paint } from "figma-api";

export class TextCount {
  count = 1;
  constructor() {
    return;
  }

  increment() {
    this.count++;
  }
}

const justifyContentCssValues = {
  MIN: "start",
  MAX: "end",
  CENTER: "center",
  SPACE_BETWEEN: "space-between",
} as const;

const alignItemsCssValues = {
  MIN: "start",
  MAX: "end",
  CENTER: "center",
} as const;

const textAlignCssValues = {
  LEFT: "left",
  RIGHT: "right",
  CENTER: "center",
  JUSTIFIED: "justify",
};

const textDecorationCssValues = {
  UNDERLINE: "underline",
  STRIKETHROUGH: "line-through",
};

export function getStyleDataForNode(node: Node): StyleData {
  const style: StyleData = {};

  if (node.visible === false) {
    style.visibility = "hidden";
  }

  if ("opacity" in node && (node?.opacity || 1) < 1) {
    style.opacity = node.opacity || 1;
  }
  if (
    node.type === "FRAME" ||
    node.type === "INSTANCE" ||
    node.type === "COMPONENT"
  ) {
    const _node = node as Node<"FRAME"> | Node<"INSTANCE"> | Node<"COMPONENT">;
    applyBorderRadiusStyle(_node, style);
    applyLayoutStyle(_node, style);
    applyBackgroundStyle(_node, style);
    applyBorderStyle(_node, style);
  } else if (node.type === "RECTANGLE") {
    const _node = node as Node<"RECTANGLE">;
    style.height = _node.size?.y;
    style.width = _node.size?.x;

    applyBorderRadiusStyle(_node, style);
    applyBackgroundStyle(_node, style);
    applyBorderStyle(_node, style);
  } else if (node.type === "TEXT") {
    const _node = node as Node<"TEXT">;
    applyTextStyle(_node, style);
  } else if (node.type === "LINE") {
    const _node = node as Node<"LINE">;
    style.height = _node.size?.y;
    style.width = _node.size?.x;

    if (_node.strokes.length > 0 && typeof _node.strokeWeight === "number") {
      const color = convertPaintToColorData(_node.strokes[0]);

      style["border-top-color"] = color;
      style["border-right-color"] = color;
      style["border-bottom-color"] = color;
      style["border-left-color"] = color;

      style["border-top-width"] = _node.strokeWeight;
      style["border-right-width"] = _node.strokeWeight;
      style["border-bottom-width"] = _node.strokeWeight;
      style["border-left-width"] = _node.strokeWeight;

      style["border-top-style"] = "solid";
      style["border-right-style"] = "solid";
      style["border-bottom-style"] = "solid";
      style["border-left-style"] = "solid";
    }
  } else if ("absoluteBoundingBox" in node) {
    style.height = Math.round(node.absoluteBoundingBox.height);
    style.width = Math.round(node.absoluteBoundingBox.width);
  }

  return style;
}

function applyBorderRadiusStyle(
  node:
    | Node<"FRAME">
    | Node<"INSTANCE">
    | Node<"COMPONENT">
    | Node<"RECTANGLE">,
  style: StyleData
) {
  style["corner-top-left"] = node.rectangleCornerRadii?.[0];
  style["corner-top-right"] = node.rectangleCornerRadii?.[1];
  style["corner-bottom-left"] = node.rectangleCornerRadii?.[2];
  style["corner-bottom-right"] = node.rectangleCornerRadii?.[3];
}
function applyLayoutStyle(
  node: Node<"FRAME"> | Node<"INSTANCE"> | Node<"COMPONENT">,
  style: StyleData
) {
  if (node.layoutMode === "HORIZONTAL" || node.layoutMode === "VERTICAL") {
    style.layout = "flex";
    style["flex-direction"] =
      node.layoutMode === "HORIZONTAL" ? "row" : "column";
    style["justify-content"] = justifyContentCssValues[
      node.primaryAxisAlignItems
    ] as any;
    style["align-items"] =
      alignItemsCssValues[node.counterAxisAlignItems as "MIN"];

    if (node.paddingTop > 0) {
      style["padding-top"] = node.paddingTop;
    }
    if (node.paddingRight > 0) {
      style["padding-right"] = node.paddingRight;
    }
    if (node.paddingBottom > 0) {
      style["padding-bottom"] = node.paddingBottom;
    }
    if (node.paddingLeft > 0) {
      style["padding-left"] = node.paddingLeft;
    }

    style["gap-x"] = node.itemSpacing;
    style["gap-y"] = node.itemSpacing;

    if (node.layoutGrow) {
      if (node.layoutMode === "HORIZONTAL") {
        style.width = {
          value: node.layoutGrow,
          unit: "fr",
        };
      } else {
        style.height = {
          value: node.layoutGrow,
          unit: "fr",
        };
      }
    }

    if ((node as any).layoutWrap) {
      style["flex-wrap"] = "wrap";
    }
  }

  if (node.clipsContent) {
    style.overflow = "hidden";
  }

  if ((node as any).layoutSizingHorizontal === "FIXED") {
    style.width = Math.round(node.absoluteBoundingBox.width);
  } else if ((node as any).layoutSizingHorizontal === "FILL") {
    style.width = {
      value: 1,
      unit: "fr",
    };
  }

  if ((node as any).layoutSizingVertical === "FIXED") {
    style.height = Math.round(node.absoluteBoundingBox.height);
  } else if ((node as any).layoutSizingVertical === "FILL") {
    style.height = {
      value: 1,
      unit: "fr",
    };
  }
}
function applyBackgroundStyle(
  node:
    | Node<"FRAME">
    | Node<"INSTANCE">
    | Node<"COMPONENT">
    | Node<"RECTANGLE">,
  style: StyleData
) {
  if ((node.fills as Paint[]).length > 0) {
    const paint = (node.fills as Paint[])[0];
    if (paint.type === "SOLID") {
      style.background = convertPaintToFillData(paint);
    }
  }
}
function applyBorderStyle(
  node:
    | Node<"FRAME">
    | Node<"INSTANCE">
    | Node<"COMPONENT">
    | Node<"RECTANGLE">
    | Node<"LINE">,
  style: StyleData
) {
  if (node.strokes.length > 0) {
    const color = convertPaintToColorData(node.strokes[0]);

    style["border-top-color"] = color;
    style["border-right-color"] = color;
    style["border-bottom-color"] = color;
    style["border-left-color"] = color;

    if (node.individualStrokeWeights) {
      style["border-top-width"] = node.individualStrokeWeights.top;
      style["border-right-width"] = node.individualStrokeWeights.right;
      style["border-bottom-width"] = node.individualStrokeWeights.bottom;
      style["border-left-width"] = node.individualStrokeWeights.left;
    }

    style["border-top-style"] = "solid";
    style["border-right-style"] = "solid";
    style["border-bottom-style"] = "solid";
    style["border-left-style"] = "solid";
  }
}
function applyTextStyle(node: Node<"TEXT">, style: StyleData) {
  style["text-align"] = textAlignCssValues[node.style.textAlignHorizontal];
  style["text-decoration"] =
    textDecorationCssValues[node.style.textDecoration as "UNDERLINE"];

  if (typeof node.style.fontSize === "number") {
    style["font-size"] = node.style.fontSize;
  }
  if (node.style.lineHeightUnit === "PIXELS") {
    style["line-height"] = node.style.lineHeightPx;
  } else if (node.style.lineHeightUnit === "FONT_SIZE_%") {
    style["line-height"] = {
      value: (node.style.lineHeightPercentFontSize ?? 100) / 100,
      unit: "em",
    } as any;
  }
  if (typeof node.style.letterSpacing === "object") {
    style["letter-spacing"] = node.style.letterSpacing;
  }
  if (Array.isArray(node.fills) && node.fills.length > 0) {
    style.color = convertPaintToColorData(node.fills[0]);
  }
}

function convertPaintToFillData(paint: Paint): FillData {
  switch (paint.type) {
    case "SOLID":
      return {
        type: "color",
        color: {
          r: (paint.color?.r ?? 0) * 255,
          g: (paint.color?.g ?? 0) * 255,
          b: (paint.color?.b ?? 0) * 255,
          a: paint.opacity ?? 1,
        },
      };
    case "GRADIENT_LINEAR":
      return {
        type: "gradient",
        gradient: {
          variant: "linear",
          stops:
            paint.gradientStops?.map((stop) => ({
              position: stop.position,
              color: stop.color,
            })) ?? [],
        },
      };
    case "GRADIENT_RADIAL":
      return {
        type: "gradient",
        gradient: {
          variant: "radial",
          stops:
            paint.gradientStops?.map((stop) => ({
              position: stop.position,
              color: stop.color,
            })) ?? [],
        },
      };
    case "IMAGE":
      return {
        type: "image",
      };
    default:
      return {
        type: "color",
        color: {
          r: 0,
          g: 0,
          b: 0,
          a: 1,
        },
      };
  }
}
function convertPaintToColorData(paint: Paint): ColorData {
  switch (paint.type) {
    case "SOLID":
      return {
        r: (paint.color?.r ?? 0) * 255,
        g: (paint.color?.g ?? 0) * 255,
        b: (paint.color?.b ?? 0) * 255,
        a: paint.opacity ?? 1,
      };
    default:
      return { r: 0, g: 0, b: 0, a: 1 };
  }
}
