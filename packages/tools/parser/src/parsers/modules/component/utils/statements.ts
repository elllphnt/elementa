import type { Node} from "ts-morph";
import { SyntaxKind } from "ts-morph";
import { isInNode } from "./navigation.js";

export function addStatementsBeforeNode(node: Node, ...statements: string[]) {
  const block =
    node.getFirstAncestorByKind(SyntaxKind.Block) || node.getSourceFile();
  const currentStatement = block.getStatement((s) => isInNode(node, s));
  if (!currentStatement) {
    throw new Error("Node is not part of a statement in a block.");
  }
  const index = currentStatement.getChildIndex();
  block.insertStatements(index, statements);
}

export function addStatementsAfterNode(node: Node, ...statements: string[]) {
  const block =
    node.getFirstAncestorByKind(SyntaxKind.Block) || node.getSourceFile();
  const currentStatement = block.getStatement((s) => isInNode(node, s));
  if (!currentStatement) {
    throw new Error("Node is not part of a statement in a block.");
  }
  const index = currentStatement.getChildIndex() + 1;
  block.insertStatements(index, statements);
}
