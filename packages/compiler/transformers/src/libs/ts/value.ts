import type {
  ClassDeclaration,
  EnumDeclaration,
  Expression,
  FunctionDeclaration,
} from "ts-morph";
import { Node } from "ts-morph";

export type ResolvedValueNode = {
  names: string[];
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
    return { names: name ? [name] : [], node };
  } else if (Node.isClassDeclaration(node)) {
    const name = node.getName();
    return { names: name ? [name] : [], node };
  } else if (Node.isEnumDeclaration(node)) {
    const name = node.getName();
    return { names: name ? [name] : [], node };
  } else if (Node.isVariableDeclaration(node)) {
    const name = node.getName();
    const exp = node.getInitializer();
    if (exp) {
      const fn = getValueFromNode(exp);
      return fn
        ? {
            names: name ? [name, ...fn.names] : fn.names,
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
    return getValueFromNode(firstDeclaration);
  }
  // identifiers
  else if (Node.isIdentifier(node)) {
    const symbol = node.getSymbol();
    if (!symbol) return undefined;
    const declarations = symbol.getDeclarations();

    for (const declaration of declarations) {
      const fn = getValueFromNode(declaration);
      if (fn) {
        return fn;
      }
    }
  }
  // expressions
  else if (Node.isExpression(node)) {
    return { names: [], node };
  }

  return undefined;
}
