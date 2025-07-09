import * as ts from "typescript";

export function compileExpressionElement(data: any): ts.JsxExpression {
  const expression = data.expression;
  if (!expression) {
    return ts.factory.createJsxExpression(
      undefined,
      ts.factory.createJsxFragment(
        ts.factory.createJsxOpeningFragment(),
        [],
        ts.factory.createJsxJsxClosingFragment()
      )
    );
  }

  return ts.factory.createJsxExpression(
    undefined,
    ts.factory.createIdentifier(expression)
  );
}

export function compileFragmentElement(data: any): ts.JsxExpression {
  const fragmentId = data.fragmentId;
  if (!fragmentId) {
    return ts.factory.createJsxExpression(
      undefined,
      ts.factory.createJsxFragment(
        ts.factory.createJsxOpeningFragment(),
        [],
        ts.factory.createJsxJsxClosingFragment()
      )
    );
  }

  // Create fragment call with params
  const params = data.params
    ? Object.entries(data.params).map(([key, value]) =>
        ts.factory.createPropertyAssignment(
          ts.factory.createIdentifier(key),
          ts.factory.createIdentifier(JSON.stringify(value))
        )
      )
    : [];

  return ts.factory.createJsxExpression(
    undefined,
    ts.factory.createCallExpression(
      ts.factory.createElementAccessExpression(
        ts.factory.createIdentifier("fragments"),
        ts.factory.createStringLiteral(fragmentId)
      ),
      undefined,
      [ts.factory.createObjectLiteralExpression(params)]
    )
  );
}

export function compileMediaElement(data: any): ts.JsxElement {
  if (!data.media) {
    return createErrorElement("Missing media content");
  }

  const tag = data.media.type === "video" ? "video" : "img";
  const attributes: ts.JsxAttributeLike[] = [];

  // Add media-specific attributes
  if (data.media.src) {
    attributes.push(
      ts.factory.createJsxAttribute(
        ts.factory.createIdentifier("src"),
        ts.factory.createJsxExpression(
          undefined,
          ts.factory.createStringLiteral(data.media.src)
        )
      )
    );
  }

  return ts.factory.createJsxElement(
    ts.factory.createJsxOpeningElement(
      ts.factory.createIdentifier(tag),
      undefined,
      ts.factory.createJsxAttributes(attributes)
    ),
    [],
    ts.factory.createJsxClosingElement(ts.factory.createIdentifier(tag))
  );
}

export function compilePrimitiveElement(data: any): ts.JsxElement {
  if (!data.primitiveUrl) {
    return createErrorElement("Missing primitive URL");
  }

  const primitiveName =
    data.primitiveUrl
      .split("/")
      .pop()
      ?.replace(/\.[^/.]+$/, "") || "Primitive";
  const capitalizedName =
    primitiveName.charAt(0).toUpperCase() + primitiveName.slice(1);

  return ts.factory.createJsxElement(
    ts.factory.createJsxOpeningElement(
      ts.factory.createIdentifier(capitalizedName),
      undefined,
      ts.factory.createJsxAttributes([])
    ),
    [],
    ts.factory.createJsxClosingElement(
      ts.factory.createIdentifier(capitalizedName)
    )
  );
}

export function compileVectorElement(data: any): ts.JsxElement {
  const attributes: ts.JsxAttributeLike[] = [];

  // Add SVG-specific attributes
  const svgProps = ["width", "height", "viewBox", "preserveAspectRatio"];
  for (const prop of svgProps) {
    if (data[prop] !== undefined) {
      attributes.push(
        ts.factory.createJsxAttribute(
          ts.factory.createIdentifier(prop),
          ts.factory.createJsxExpression(
            undefined,
            ts.factory.createStringLiteral(String(data[prop]))
          )
        )
      );
    }
  }

  return ts.factory.createJsxElement(
    ts.factory.createJsxOpeningElement(
      ts.factory.createIdentifier("svg"),
      undefined,
      ts.factory.createJsxAttributes(attributes)
    ),
    [],
    ts.factory.createJsxClosingElement(ts.factory.createIdentifier("svg"))
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
