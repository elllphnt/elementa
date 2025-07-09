import type {
  BaseElementData,
  InteractionEvent,
} from "@elllphnt/elementa-base";
import { reactInteractionEventMap } from "@elllphnt/elementa-base";
import * as ts from "typescript";

export function compileElementAttributes(
  data: BaseElementData<string>
): ts.JsxAttributeLike[] {
  const attributes: ts.JsxAttributeLike[] = [];

  // Add base element attributes
  if (data.ariaLabel) {
    attributes.push(
      ts.factory.createJsxAttribute(
        ts.factory.createIdentifier("aria-label"),
        ts.factory.createJsxExpression(
          undefined,
          ts.factory.createStringLiteral(data.ariaLabel)
        )
      )
    );
  }

  if (data.ariaHidden !== undefined) {
    attributes.push(
      ts.factory.createJsxAttribute(
        ts.factory.createIdentifier("aria-hidden"),
        ts.factory.createJsxExpression(
          undefined,
          ts.factory.createIdentifier(String(data.ariaHidden))
        )
      )
    );
  }

  if (data.ariaRole) {
    attributes.push(
      ts.factory.createJsxAttribute(
        ts.factory.createIdentifier("role"),
        ts.factory.createJsxExpression(
          undefined,
          ts.factory.createStringLiteral(data.ariaRole)
        )
      )
    );
  }

  if (data.tabIndex !== undefined) {
    attributes.push(
      ts.factory.createJsxAttribute(
        ts.factory.createIdentifier("tabIndex"),
        ts.factory.createJsxExpression(
          undefined,
          ts.factory.createNumericLiteral(String(data.tabIndex))
        )
      )
    );
  }

  // Add interaction handlers
  if (data.interactions) {
    for (const [event, expr] of Object.entries(data.interactions)) {
      const reactEvent = reactInteractionEventMap[event as InteractionEvent];
      if (reactEvent) {
        attributes.push(
          ts.factory.createJsxAttribute(
            ts.factory.createIdentifier(reactEvent),
            ts.factory.createJsxExpression(
              undefined,
              ts.factory.createIdentifier(String(expr))
            )
          )
        );
      }
    }
  }

  // Add className if stylesheet exists
  if (data.stylesheet) {
    attributes.push(
      ts.factory.createJsxAttribute(
        ts.factory.createIdentifier("className"),
        ts.factory.createJsxExpression(
          undefined,
          ts.factory.createStringLiteral("generated-class")
        )
      )
    );
  }

  // Handle links
  if (data.link) {
    if (data.link.type === "href" && data.link.href) {
      attributes.push(
        ts.factory.createJsxAttribute(
          ts.factory.createIdentifier("href"),
          ts.factory.createJsxExpression(
            undefined,
            ts.factory.createStringLiteral(data.link.href)
          )
        )
      );
    }
  }

  return attributes;
}
