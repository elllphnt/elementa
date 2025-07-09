import type {
  ArrowFunction,
  CallExpression,
  FunctionDeclaration,
  FunctionExpression,
} from "ts-morph";
import { Node } from "ts-morph";

export function isComponentName(name: string): boolean {
  return /^[A-Z][a-zA-Z0-9]*$/.test(name);
}

export type ComponentNode =
  | FunctionDeclaration
  | ArrowFunction
  | FunctionExpression
  | CallExpression;

export function isComponentNode(node: Node): node is ComponentNode {
  if (
    Node.isFunctionDeclaration(node) ||
    Node.isArrowFunction(node) ||
    Node.isFunctionExpression(node)
  ) {
    return true;
  } else if (Node.isCallExpression(node)) {
    const callee = node.getFirstChild();
    const expression = node.getExpression();
    let calleeName: string | undefined;
    if (Node.isIdentifier(callee)) {
      calleeName = callee.getText();
    } else if (Node.isPropertyAccessExpression(callee)) {
      calleeName = callee.getName();
    }
    return (
      (calleeName === "memo" || calleeName === "forwardRef") &&
      isComponentNode(expression)
    );
  }
  return false;
}

export function isHookName(name: string): boolean {
  return /^use[A-Z]/.test(name);
}

export function isContextName(name: string): boolean {
  return /^[A-Z][a-zA-Z0-9]*Context$/.test(name);
}
