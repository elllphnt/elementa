import type { ImportData } from "@elllphnt/elementa-base";
import ts from "typescript";

export function resolveImportFromSymbol({
  symbol,
  sourceFile,
}: {
  symbol: ts.Symbol;
  sourceFile: ts.SourceFile;
}): ImportData | undefined {
  const declarations = symbol.getDeclarations();
  if (!declarations || declarations.length === 0) {
    return undefined;
  }

  for (const decl of declarations) {
    if (decl.getSourceFile() !== sourceFile) continue;

    if (ts.isImportClause(decl)) {
      const moduleSpecifier = decl.parent.moduleSpecifier.getText();
      return {
        module: moduleSpecifier.replace(/['"]/g, ""), // Remove quotes
        alias: decl.name ? decl.name.getText() : symbol.getName(),
      };
    } else if (ts.isImportSpecifier(decl)) {
      const moduleSpecifier =
        decl.parent.parent.parent.moduleSpecifier.getText();
      const name = decl.propertyName?.getText() || decl.name.getText();
      const alias = decl.name.getText();
      return {
        module: moduleSpecifier.replace(/['"]/g, ""), // Remove quotes
        name,
        alias,
      };
    }
  }
}
