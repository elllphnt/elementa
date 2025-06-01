import generateModule from "@babel/generator";
import * as t from "@babel/types";

export const generate: typeof generateModule =
  typeof generateModule === "function"
    ? generateModule
    : (generateModule as any).default;

export function generateExpressionSource(expr: t.Node): string {
  const { code } = generate(expr, {});
  return code;
}
