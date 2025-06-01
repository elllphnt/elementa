import { init } from "@paralleldrive/cuid2";
import { Node, NumericLiteral, StringLiteral, SyntaxKind } from "ts-morph";

export const genId = init({ length: 8 });

export function extractArgValue(arg: Node): any {
  const kind = arg.getKind();
  if (kind === SyntaxKind.StringLiteral) {
    const strLit = arg as StringLiteral;
    return strLit.getLiteralText();
  }
  if (kind === SyntaxKind.NumericLiteral) {
    const numLit = arg as NumericLiteral;
    return Number(numLit.getText());
  }
  if (kind === SyntaxKind.TrueKeyword) {
    return true;
  }
  if (kind === SyntaxKind.FalseKeyword) {
    return false;
  }
  return { __expression: arg.getText() };
}
