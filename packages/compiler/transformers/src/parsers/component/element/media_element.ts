import type {
  ImageMediaData,
  MediaElementData,
  VideoMediaData,
} from "@elllphnt/elementa-base";
import type { JsxElement } from "ts-morph";
import { Node } from "ts-morph";
import { parseBaseElementNode } from "./base/base_element.js";
import type {
  ElementAttributeEntry,
  ParseElementContext,
} from "./utils/types.js";

export function parseMediaElementNode({
  node,
  context,
}: {
  node: JsxElement;
  context: ParseElementContext;
}): MediaElementData {
  const tagNameNode = node.getOpeningElement().getTagNameNode();
  const tag = tagNameNode.getText();
  const attributes: ElementAttributeEntry[] = node
    .getOpeningElement()
    .getAttributes()
    .map((attr) => {
      if (Node.isJsxAttribute(attr)) {
        const nameNode = attr.getNameNode();
        if (Node.isIdentifier(nameNode)) {
          const value = attr.getInitializer();
          return [nameNode.getText(), value] as const;
        } else {
          throw new Error(
            `Expected identifier for attribute name, got ${nameNode.getKindName()}`,
          );
        }
      } else {
        return attr.getExpression();
      }
    });

  // Parse the base <media> element
  const base = parseBaseElementNode({
    type: "media",
    tag,
    attributes,
    context,
  });

  // Parse media-specific attributes
  let mediaData: ImageMediaData | VideoMediaData | undefined;
  let fit: MediaElementData["fit"];
  let position: MediaElementData["position"];

  // Determine media type from tag or attributes
  const isVideo =
    tag === "video" ||
    attributes.some(
      (attr) =>
        Array.isArray(attr) &&
        (attr[0] === "autoplay" ||
          attr[0] === "controls" ||
          attr[0] === "loop" ||
          attr[0] === "muted"),
    );

  if (isVideo) {
    const videoData: VideoMediaData = {
      type: "video" as const,
    };

    // Parse video-specific attributes
    attributes.forEach((attr) => {
      if (Array.isArray(attr)) {
        const [name, value] = attr;
        switch (name) {
          case "src":
            if (value && Node.isStringLiteral(value)) {
              videoData.src = value.getLiteralValue();
            } else if (value && Node.isJsxExpression(value)) {
              const expr = value.getExpression();
              if (expr && Node.isStringLiteral(expr)) {
                videoData.src = expr.getLiteralValue();
              } else if (expr) {
                videoData.src = {
                  __expression: expr.getText(),
                };
              }
            }
            break;
          case "autoplay":
            if (value) {
              videoData.autoplay = {
                __expression: value.getText(),
              };
            }
            break;
          case "controls":
            if (value) {
              videoData.controls = {
                __expression: value.getText(),
              };
            }
            break;
          case "loop":
            if (value) {
              videoData.loop = {
                __expression: value.getText(),
              };
            }
            break;
          case "muted":
            if (value) {
              videoData.muted = {
                __expression: value.getText(),
              };
            }
            break;
          case "poster":
            if (value && Node.isStringLiteral(value)) {
              videoData.poster = value.getLiteralValue();
            } else if (value && Node.isJsxExpression(value)) {
              const expr = value.getExpression();
              if (expr && Node.isStringLiteral(expr)) {
                videoData.poster = expr.getLiteralValue();
              } else if (expr) {
                videoData.poster = {
                  __expression: expr.getText(),
                };
              }
            }
            break;
        }
      }
    });

    mediaData = videoData;
  } else {
    // Default to image
    const imageData: ImageMediaData = {
      type: "image" as const,
    };

    // Parse image-specific attributes
    attributes.forEach((attr) => {
      if (Array.isArray(attr)) {
        const [name, value] = attr;
        switch (name) {
          case "src":
            if (value && Node.isStringLiteral(value)) {
              imageData.src = value.getLiteralValue();
            } else if (value && Node.isJsxExpression(value)) {
              const expr = value.getExpression();
              if (expr && Node.isStringLiteral(expr)) {
                imageData.src = expr.getLiteralValue();
              } else if (expr) {
                imageData.src = {
                  __expression: expr.getText(),
                };
              }
            }
            break;
          case "alt":
            if (value) {
              imageData.alt = {
                __expression: value.getText(),
              };
            }
            break;
        }
      }
    });

    mediaData = imageData;
  }

  // Parse container-level media attributes
  attributes.forEach((attr) => {
    if (Array.isArray(attr)) {
      const [name, value] = attr;
      switch (name) {
        case "fit":
          if (value) {
            fit = {
              __expression: value.getText(),
            };
          }
          break;
        case "position":
          if (value) {
            // TODO: Parse position object properly
            position = {
              x: { __expression: value.getText() },
              y: { __expression: value.getText() },
            };
          }
          break;
      }
    }
  });

  return {
    ...base,
    media: mediaData,
    fit,
    position,
  } as MediaElementData;
}
