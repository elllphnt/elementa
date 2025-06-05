import { SourceFile } from "ts-morph";
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
