import { Node, SourceFile } from "ts-morph";
import { getValueFromNode, ResolvedValueNode } from "./value.js";

export function resolveDefaultExportValueNode(
  sourceFile: SourceFile
): ResolvedValueNode | undefined {
  const symbol = sourceFile.getDefaultExportSymbol();
  if (!symbol) return undefined;
  const declarations = symbol.getDeclarations();

  for (const node of declarations) {
    const fn = getValueFromNode(node);
    if (fn) return fn;
  }
}
export function resolveExportValueNodes(
  sourceFile: SourceFile
): ResolvedValueNode[] {
  const symbols = sourceFile.getExportSymbols();
  return symbols
    .map((symbol) => {
      const declarations = symbol.getDeclarations();

      for (const node of declarations) {
        const fn = getValueFromNode(node);
        if (fn) return fn;
      }
    })
    .filter(Boolean) as ResolvedValueNode[];
}
export function resolveRootValueNodes(
  sourceFile: SourceFile
): ResolvedValueNode[] {
  const statements = sourceFile.getStatements();
  const valueMap = new Map<Node, ResolvedValueNode>();
  for (const statement of statements) {
    const value = getValueFromNode(statement);
    if (value) {
      valueMap.set(value.node, value);
    }
  }
  return Array.from(valueMap.values());
}
