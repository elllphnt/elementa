import { Evaluable, isExpression } from "@elllphnt/elll-element";

export function transpileEvaluable(value: Evaluable<any>): string {
  if (isExpression(value)) {
    return value.__expression;
  } else {
    return JSON.stringify(value);
  }
}
