import type { ImportDeclaration } from "ts-morph";
import { Node } from "ts-morph";

export function generateImportStatements(
  importMap: Record<string, Record<string, string>>
): string {
  const lines: string[] = [];

  for (const [source, specifiers] of Object.entries(importMap)) {
    const namedImports: string[] = [];
    let defaultImport: string | undefined;
    let namespaceImport: string | undefined;

    for (const [specifier, alias] of Object.entries(specifiers)) {
      if (specifier === "default") {
        defaultImport = alias;
      } else if (specifier === "*") {
        namespaceImport = alias;
      } else {
        namedImports.push(
          specifier === alias ? specifier : `${specifier} as ${alias}`
        );
      }
    }

    let line = "import ";
    const parts: string[] = [];

    if (defaultImport) parts.push(defaultImport);
    if (namespaceImport) parts.push(`* as ${namespaceImport}`);
    if (namedImports.length) parts.push(`{ ${namedImports.join(", ")} }`);

    line += parts.join(", ") + ` from "${source}";`;
    lines.push(line);
  }

  return lines.join("\n");
}

export function extractImport(
  statement: ImportDeclaration,
  module: { imports: Record<string, [string, string]> }
) {
  const moduleSpecifier = statement.getModuleSpecifierValue();
  if (!moduleSpecifier) return;

  const namedBindings = statement.getImportClause()?.getNamedBindings();
  const defaultImport = statement.getImportClause()?.getDefaultImport();

  // Handle default import: import React from "react"
  if (defaultImport) {
    const name = defaultImport.getText();
    module.imports[name] = [moduleSpecifier, "default"];
  }

  // Handle named imports: import { useState, useEffect as ue } from "react"
  if (Node.isNamedImports(namedBindings)) {
    for (const element of namedBindings.getElements()) {
      const name = element.getNameNode().getText();
      const alias = element.getAliasNode()?.getText() ?? name;
      module.imports[alias] = [moduleSpecifier, name];
    }
  }

  // Handle namespace import: import * as React from "react"
  if (Node.isNamespaceImport(namedBindings)) {
    const alias = namedBindings.getName();
    module.imports["*"] = [moduleSpecifier, alias];
  }
}

export function extractImportNew(
  statement: ImportDeclaration,
  imports: Record<string, [string, string]>
) {
  const moduleSpecifier = statement.getModuleSpecifierValue();
  if (!moduleSpecifier) return;

  const namedBindings = statement.getImportClause()?.getNamedBindings();
  const defaultImport = statement.getImportClause()?.getDefaultImport();

  // Handle default import: import React from "react"
  if (defaultImport) {
    const name = defaultImport.getText();
    imports[name] = [moduleSpecifier, "default"];
  }

  // Handle named imports: import { useState, useEffect as ue } from "react"
  if (Node.isNamedImports(namedBindings)) {
    for (const element of namedBindings.getElements()) {
      const name = element.getNameNode().getText();
      const alias = element.getAliasNode()?.getText() ?? name;
      imports[alias] = [moduleSpecifier, name];
    }
  }

  // Handle namespace import: import * as React from "react"
  if (Node.isNamespaceImport(namedBindings)) {
    const alias = namedBindings.getName();
    imports["*"] = [moduleSpecifier, alias];
  }
}
