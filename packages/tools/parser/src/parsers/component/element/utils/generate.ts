import * as g from "@babel/generator";
import type * as t from "@babel/types";

export const generate = g.generate;

export function generateExpressionSource(expr: t.Node): string {
  const { code } = generate(expr, {});
  return code;
}
