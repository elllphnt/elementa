import type { ExpressionElementData } from "@elllphnt/elementa-base";

export function generatorExpressionElement(
  data: ExpressionElementData,
): string {
  const expression = data.expression;
  return expression ? `<>{${expression}}</>` : `<></>`;
}
