import { Expression } from "ts-morph";

export function getDeepExpression(expression: Expression) {
  if (Expression.isParenthesizedExpression(expression)) {
    return getDeepExpression(expression.getExpression());
  } else {
    return expression;
  }
}
