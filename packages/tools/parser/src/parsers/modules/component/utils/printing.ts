import { Node } from "ts-morph";

export function getLineText(node: Node): string {
  const sourceFile = node.getSourceFile();
  const fullText = sourceFile.getFullText();

  const { line } = sourceFile.getLineAndColumnAtPos(node.getStart());
  const lineStarts = sourceFile.compilerNode.getLineStarts();

  const startPos = lineStarts[line - 1];
  const endPos = line < lineStarts.length ? lineStarts[line] : fullText.length;

  return fullText.slice(startPos, endPos).trimEnd();
}
