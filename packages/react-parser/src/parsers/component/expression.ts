export function parseExpression({
  node,
}: {
  node: t.JSXExpressionContainer;
}): ElementData {
  return {
    id: genId(),
    type: "expression",
    expression: `Expression Container not implemented yet: ${generate(node)}`,
  };
}
