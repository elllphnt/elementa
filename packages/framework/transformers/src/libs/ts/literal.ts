import type { Expression } from "ts-morph";
import { Node } from "ts-morph";

/**
 * Recursively parse an Expression (from ts-morph) into a plain JS value.
 * Supports object, array, string, number, boolean, null.
 */
export function parseLiteral(expr: Expression): any {
  if (Node.isObjectLiteralExpression(expr)) {
    const obj: any = {};
    for (const prop of expr.getProperties()) {
      if (Node.isPropertyAssignment(prop)) {
        const key = prop
          .getNameNode()
          .getText()
          .replace(/^["']|["']$/g, "");
        obj[key] = parseLiteral(prop.getInitializerOrThrow());
      } else if (Node.isShorthandPropertyAssignment(prop)) {
        // Optionally: resolve from scope if you want, or skip/throw.
        throw new Error("Shorthand properties not supported in parseLiteral.");
      } else if (Node.isSpreadAssignment(prop)) {
        throw new Error("Spread properties not supported in parseLiteral.");
      } else {
        throw new Error("Unknown object property in parseLiteral.");
      }
    }
    return obj;
  }
  if (Node.isArrayLiteralExpression(expr)) {
    return expr.getElements().map(parseLiteral);
  }
  if (Node.isStringLiteral(expr)) {
    return expr.getLiteralText();
  }
  if (Node.isNumericLiteral(expr)) {
    return Number(expr.getText());
  }
  if (Node.isTrueLiteral(expr)) return true;
  if (Node.isFalseLiteral(expr)) return false;
  if (Node.isNullLiteral(expr)) return null;
  if (Node.isBooleanKeyword(expr)) {
    return expr.getText() === "true";
  }
  throw new Error(
    `Unsupported literal node kind: ${(expr as any).getKindName()}`,
  );
}
