import type {
  ArrowFunction,
  Block,
  FunctionDeclaration,
  FunctionExpression,
  SourceFile} from "ts-morph";
import {
  Node,
  SyntaxKind,
} from "ts-morph";

export function isInNode(node: Node, container: Node): boolean {
  const start = node.getStart();
  const end = node.getEnd();
  const containerStart = container.getStart();
  const containerEnd = container.getEnd();
  return start >= containerStart && end <= containerEnd;
}
export function isBeforeNode(node: Node, ref: Node): boolean {
  const start = node.getStart();
  const refStart = ref.getEnd();
  return start < refStart;
}
export function isAfterNode(node: Node, ref: Node): boolean {
  const end = node.getEnd();
  const refEnd = ref.getStart();
  return end > refEnd;
}

/**
 * Given an ObjectBindingPattern (e.g. `({ a, b }) => …` or `const { x, y } = obj;`),
 * return the Block where subsequent identifier‐replacements should occur.
 *
 *  • If this binding lives in a parameter (e.g. `function fn({ a }) { … }` or `const f = ({ b }) => { … }`),
 *    return the function’s body (must be a Block).
 *  • Otherwise, return the nearest enclosing Block, or if none exists, the SourceFile itself.
 */
export function getEnclosingBlock(binding: Node): Block | SourceFile {
  // 1) Check if this binding is part of a parameter declaration
  const paramDecl = binding.getFirstAncestorByKind(SyntaxKind.Parameter);
  if (paramDecl) {
    // The parent of a ParameterDeclaration is a FunctionDeclaration / FunctionExpression / ArrowFunction
    const func = paramDecl.getFirstAncestor(
      (n) =>
        Node.isFunctionDeclaration(n) ||
        Node.isFunctionExpression(n) ||
        Node.isArrowFunction(n)
    );
    if (func) {
      // We know FunctionDeclaration/Expression/ArrowFunction have getBody()
      const body = (
        func as FunctionDeclaration | FunctionExpression | ArrowFunction
      ).getBody();

      if (body && Node.isBlock(body)) {
        return body;
      }
    }
    // If for some reason there is no block body (e.g. arrow with expression), fall through
  }

  // 2) Otherwise, return the nearest enclosing Block (e.g. inside another { … }) or the SourceFile
  return (
    binding.getFirstAncestorByKind(SyntaxKind.Block) || binding.getSourceFile()
  );
}
