import * as t from "@babel/types";
import {
  Evaluable,
  ImageMediaData,
  MediaElementData,
  VideoMediaData,
} from "@elllphnt/elementa-base";
import { GetStylesheet, parseBaseElementNode } from "./base_element.js";
import { generateExpressionSource } from "./utils/generate.js";

export function parseMediaElementNode({
  node,
  getStylesheet,
}: {
  node: t.JSXElement;
  getStylesheet: GetStylesheet;
}): MediaElementData {
  // Parse the base <media> element
  const base = parseBaseElementNode({
    type: "media",
    node,
    getStylesheet,
  });

  // Prepare to collect media attributes
  let mediaType: "image" | "video" = "image";
  let srcValue: string | { __expression: string } | undefined;
  let altValue: string | { __expression: string } | undefined;
  let posterValue: string | { __expression: string } | undefined;
  let autoplayValue: string | { __expression: string } | undefined;
  let loopValue: string | { __expression: string } | undefined;
  let mutedValue: string | { __expression: string } | undefined;
  let controlsValue: string | { __expression: string } | undefined;
  let fitValue: string | { __expression: string } | undefined;
  let posXValue: string | { __expression: string } | undefined;
  let posYValue: string | { __expression: string } | undefined;

  node.openingElement.attributes.forEach((attr) => {
    if (!t.isJSXAttribute(attr)) return;
    const name = attr.name.name as string;
    const valueNode = attr.value;

    // Determine media type: <elll-media type="video" ...>
    if (name === "type" && valueNode) {
      if (t.isStringLiteral(valueNode)) {
        if (valueNode.value === "video") {
          mediaType = "video";
        }
      } else if (t.isJSXExpressionContainer(valueNode)) {
        const expr = valueNode.expression;
        if (t.isStringLiteral(expr) && expr.value === "video") {
          mediaType = "video";
        }
      }
      return;
    }

    // src attribute
    if (name === "src" && valueNode) {
      if (t.isStringLiteral(valueNode)) {
        srcValue = valueNode.value;
      } else if (t.isJSXExpressionContainer(valueNode)) {
        srcValue = {
          __expression: generateExpressionSource(valueNode.expression),
        };
      }
      return;
    }

    // alt attribute (only relevant if image)
    if (name === "alt" && valueNode) {
      if (t.isStringLiteral(valueNode)) {
        altValue = valueNode.value;
      } else if (t.isJSXExpressionContainer(valueNode)) {
        altValue = {
          __expression: generateExpressionSource(valueNode.expression),
        };
      }
      return;
    }

    // poster attribute (only relevant if video)
    if (name === "poster" && valueNode) {
      if (t.isStringLiteral(valueNode)) {
        posterValue = valueNode.value;
      } else if (t.isJSXExpressionContainer(valueNode)) {
        posterValue = {
          __expression: generateExpressionSource(valueNode.expression),
        };
      }
      return;
    }

    // autoplay (video)
    if (name === "autoplay" && valueNode) {
      if (t.isStringLiteral(valueNode)) {
        autoplayValue = valueNode.value;
      } else if (t.isJSXExpressionContainer(valueNode)) {
        autoplayValue = {
          __expression: generateExpressionSource(valueNode.expression),
        };
      }
      return;
    }

    // loop (video)
    if (name === "loop" && valueNode) {
      if (t.isStringLiteral(valueNode)) {
        loopValue = valueNode.value;
      } else if (t.isJSXExpressionContainer(valueNode)) {
        loopValue = {
          __expression: generateExpressionSource(valueNode.expression),
        };
      }
      return;
    }

    // muted (video)
    if (name === "muted" && valueNode) {
      if (t.isStringLiteral(valueNode)) {
        mutedValue = valueNode.value;
      } else if (t.isJSXExpressionContainer(valueNode)) {
        mutedValue = {
          __expression: generateExpressionSource(valueNode.expression),
        };
      }
      return;
    }

    // controls (video)
    if (name === "controls" && valueNode) {
      if (t.isStringLiteral(valueNode)) {
        controlsValue = valueNode.value;
      } else if (t.isJSXExpressionContainer(valueNode)) {
        controlsValue = {
          __expression: generateExpressionSource(valueNode.expression),
        };
      }
      return;
    }

    // fit (object-fit style)
    if (name === "fit" && valueNode) {
      if (t.isStringLiteral(valueNode)) {
        fitValue = valueNode.value;
      } else if (t.isJSXExpressionContainer(valueNode)) {
        fitValue = {
          __expression: generateExpressionSource(valueNode.expression),
        };
      }
      return;
    }

    // positionX
    if ((name === "positionX" || name === "posX") && valueNode) {
      if (t.isStringLiteral(valueNode)) {
        posXValue = valueNode.value;
      } else if (t.isJSXExpressionContainer(valueNode)) {
        posXValue = {
          __expression: generateExpressionSource(valueNode.expression),
        };
      }
      return;
    }

    // positionY
    if ((name === "positionY" || name === "posY") && valueNode) {
      if (t.isStringLiteral(valueNode)) {
        posYValue = valueNode.value;
      } else if (t.isJSXExpressionContainer(valueNode)) {
        posYValue = {
          __expression: generateExpressionSource(valueNode.expression),
        };
      }
      return;
    }
  });

  // Build the media-specific object
  let mediaData: ImageMediaData | VideoMediaData;
  if ((mediaType as any) === "video") {
    mediaData = {
      type: "video",
      src: srcValue as Evaluable<string> | undefined,
      poster: posterValue as Evaluable<string> | undefined,
      autoplay: autoplayValue as Evaluable<string> | undefined,
      loop: loopValue as Evaluable<string> | undefined,
      muted: mutedValue as Evaluable<string> | undefined,
      controls: controlsValue as Evaluable<string> | undefined,
    };
  } else {
    mediaData = {
      type: "image",
      src: srcValue as Evaluable<string> | undefined,
      alt: altValue as Evaluable<string> | undefined,
    };
  }

  // Attach fit and position if provided
  const positionObj: {
    x?: Evaluable<any>;
    y?: Evaluable<any>;
  } = {};
  if (posXValue !== undefined) {
    positionObj.x = posXValue as Evaluable<string>;
  }
  if (posYValue !== undefined) {
    positionObj.y = posYValue as Evaluable<string>;
  }

  return {
    ...base,
    fit: fitValue as
      | Evaluable<"contain" | "cover" | "fill" | "none" | "scale-down">
      | undefined,
    position: Object.keys(positionObj).length ? positionObj : undefined,
    media: mediaData,
  };
}
