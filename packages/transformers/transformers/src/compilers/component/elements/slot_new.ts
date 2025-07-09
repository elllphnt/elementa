import type { SlotElementData } from "@elllphnt/elementa-base";
import * as ts from "typescript";

export function compileSlotElement(
  data: SlotElementData
): ts.JsxElement | ts.JsxExpression {
  const slotId = data.id;

  if (data.mode === "outlet") {
    return ts.factory.createJsxElement(
      ts.factory.createJsxOpeningElement(
        ts.factory.createIdentifier("Outlet"),
        undefined,
        ts.factory.createJsxAttributes([])
      ),
      [],
      ts.factory.createJsxClosingElement(ts.factory.createIdentifier("Outlet"))
    );
  }

  // Default slot behavior
  return ts.factory.createJsxExpression(
    undefined,
    ts.factory.createBinaryExpression(
      ts.factory.createPropertyAccessExpression(
        ts.factory.createElementAccessExpression(
          ts.factory.createIdentifier("fills"),
          ts.factory.createStringLiteral(slotId)
        ),
        ts.factory.createIdentifier("content")
      ),
      ts.factory.createToken(ts.SyntaxKind.QuestionQuestionToken),
      ts.factory.createNull()
    )
  );
}
