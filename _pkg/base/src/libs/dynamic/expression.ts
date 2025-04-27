import {
  Evaluable,
  Expression,
} from "../../types/_primitives/dynamic/evaluable.js";

export function isExpression(value: any): value is Expression {
  return value && typeof value === "object" && "__expression" in value;
}
export function splitEvaluable<T>(
  evaluable?: Evaluable<T>,
): [Evaluable<T> | undefined, T | undefined] {
  if (isExpression(evaluable)) {
    return [evaluable, undefined];
  } else {
    return [undefined, evaluable];
  }
}
export function expressionOf<T>(
  evaluable: Evaluable<T>,
): Expression | undefined {
  return isExpression(evaluable) ? evaluable : undefined;
}
export function constantOf<T>(evaluable: Evaluable<T>): T | undefined {
  return isExpression(evaluable) ? undefined : evaluable;
}
