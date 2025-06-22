import {
  ClassDeclaration,
  EnumDeclaration,
  Expression,
  FunctionDeclaration,
  Node,
} from "ts-morph";

export type ResolvedValueNode = {
  name?: string;
  node: Expression | FunctionDeclaration | ClassDeclaration | EnumDeclaration;
};
export function getValueFromNode(node: Node): ResolvedValueNode | undefined {
  // export assignment
  if (Node.isExportAssignment(node)) {
    const exp = node.getExpression();
    if (exp) return getValueFromNode(exp);
  }
  // declarations
  else if (Node.isFunctionDeclaration(node)) {
    const name = node.getName();
    return { name, node };
  } else if (Node.isClassDeclaration(node)) {
    const name = node.getName();
    return { name, node };
  } else if (Node.isEnumDeclaration(node)) {
    const name = node.getName();
    return { name, node };
  } else if (Node.isVariableDeclaration(node)) {
    const name = node.getName();
    const exp = node.getInitializer();
    if (exp) {
      const fn = getValueFromNode(exp);
      return fn
        ? {
            name,
            node: fn.node,
          }
        : undefined;
    }
  }
  // varaiable statements
  else if (Node.isVariableStatement(node)) {
    const declarations = node.getDeclarations();
    if (declarations.length !== 1) return undefined;
    const firstDeclaration = declarations[0];
    const name = firstDeclaration.getName();
    const exp = firstDeclaration.getInitializer();
    if (exp) {
      const fn = getValueFromNode(exp);
      return fn
        ? {
            name,
            node: fn.node,
          }
        : undefined;
    }
  }
  // identifiers
  else if (Node.isIdentifier(node)) {
    const symbol = node.getSymbol();
    if (!symbol) return undefined;
    const declarations = symbol.getDeclarations();

    const name = node.getText();
    for (const node of declarations) {
      const fn = getValueFromNode(node);
      if (fn) {
        return { name, node: fn.node };
      }
    }
  }
  // expressions
  else if (Node.isExpression(node)) {
    return { node };
  }

  return undefined;
}
