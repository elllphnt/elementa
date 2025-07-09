import type { ComponentElementData } from "@elllphnt/elementa-base";
import * as ts from "typescript";
import { compileElementAttributes } from "./_base_new.js";
import { compileElement } from "./element.js";

export function compileComponentElement(
  data: ComponentElementData
): ts.JsxElement {
  if (!data.componentUrl) {
    return createErrorElement("Missing component URL");
  }

  // Extract component name from URL (simplified)
  const componentName =
    data.componentUrl
      .split("/")
      .pop()
      ?.replace(/\.[^/.]+$/, "") || "Component";
  const capitalizedName =
    componentName.charAt(0).toUpperCase() + componentName.slice(1);

  const attributes = compileElementAttributes(data);

  // Add component props
  if (data.props) {
    for (const [key, value] of Object.entries(data.props)) {
      attributes.push(
        ts.factory.createJsxAttribute(
          ts.factory.createIdentifier(key),
          ts.factory.createJsxExpression(
            undefined,
            ts.factory.createIdentifier(JSON.stringify(value))
          )
        )
      );
    }
  }

  // Add __fills prop for slot fills
  if (data.fills) {
    const fillsProperties = Object.entries(data.fills).map(
      ([key, fill]: [string, any]) =>
        ts.factory.createPropertyAssignment(
          ts.factory.createStringLiteral(key),
          ts.factory.createObjectLiteralExpression([
            ts.factory.createPropertyAssignment(
              ts.factory.createIdentifier("content"),
              ts.factory.createJsxFragment(
                ts.factory.createJsxOpeningFragment(),
                fill.content?.map(compileElement) || [],
                ts.factory.createJsxJsxClosingFragment()
              )
            ),
          ])
        )
    );

    attributes.push(
      ts.factory.createJsxAttribute(
        ts.factory.createIdentifier("__fills"),
        ts.factory.createJsxExpression(
          undefined,
          ts.factory.createObjectLiteralExpression(fillsProperties)
        )
      )
    );
  }

  const children = data.content?.map(compileElement) || [];

  return ts.factory.createJsxElement(
    ts.factory.createJsxOpeningElement(
      ts.factory.createIdentifier(capitalizedName),
      undefined,
      ts.factory.createJsxAttributes(attributes)
    ),
    children as ts.JsxChild[],
    ts.factory.createJsxClosingElement(
      ts.factory.createIdentifier(capitalizedName)
    )
  );
}

function createErrorElement(message: string): ts.JsxElement {
  return ts.factory.createJsxElement(
    ts.factory.createJsxOpeningElement(
      ts.factory.createIdentifier("div"),
      undefined,
      ts.factory.createJsxAttributes([])
    ),
    [ts.factory.createJsxText(`/* ${message} */`, false)],
    ts.factory.createJsxClosingElement(ts.factory.createIdentifier("div"))
  );
}
