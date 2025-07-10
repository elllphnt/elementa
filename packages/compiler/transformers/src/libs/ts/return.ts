import type { ReturnStatement } from "ts-morph";
import { Node } from "ts-morph";

export function getReturnBranches(node: Node): ReturnStatement[] {
  if (Node.isReturnStatement(node)) {
    return [node];
  } else if (
    Node.isExpression(node) ||
    Node.isFunctionDeclaration(node) ||
    Node.isClassDeclaration(node) ||
    Node.isEnumDeclaration(node)
  ) {
    return [];
  } else {
    return node.getChildren().flatMap(getReturnBranches);
  }
}

/**
 * Recursively checks if `node` (or any of its descendant statements)
 * contains a “real” return that would exit the component—while skipping
 * any subtree rooted at an Expression, FunctionDeclaration, ClassDeclaration,
 * or EnumDeclaration.
 */
export function hasReturnBranch(node: Node): boolean {
  // 1) If this node _is_ a ReturnStatement, we immediately return true.
  if (Node.isReturnStatement(node)) {
    return true;
  }

  // 2) If this node is any kind of “value” (Expression, Function, Class, or Enum),
  //    we do NOT descend into it, because that return would be inside a nested function
  //    or expression that doesn’t affect the outer flow.
  if (
    Node.isExpression(node) ||
    Node.isFunctionDeclaration(node) ||
    Node.isClassDeclaration(node) ||
    Node.isEnumDeclaration(node)
  ) {
    return false;
  }

  // 3) Otherwise, inspect its children. As soon as any child subtree
  //    contains a return, bubble up true.
  for (const child of node.getChildren()) {
    if (hasReturnBranch(child)) {
      return true;
    }
  }

  // 4) No return found in this subtree
  return false;
}
