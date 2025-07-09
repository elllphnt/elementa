import type { Node, SourceFile } from "ts-morph";
import type { ResolvedValueNode } from "./value.js";
import { getValueFromNode } from "./value.js";

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

export type ResolvedExportNode = ResolvedValueNode & {
  isDefault: boolean;
};
export function resolveExportValueNodes(
  sourceFile: SourceFile
): ResolvedExportNode[] {
  const exportSymbols = sourceFile.getExportSymbols();
  const defaultExportSymbol = sourceFile.getDefaultExportSymbol();

  return exportSymbols
    .map((symbol) => {
      const declarations = symbol.getDeclarations();

      for (const node of declarations) {
        const vnode = getValueFromNode(node);
        if (vnode)
          return {
            ...vnode,
            isDefault: symbol === defaultExportSymbol,
          };
      }
    })
    .filter(Boolean) as ResolvedExportNode[];
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
