import { ImportDeclaration, Node } from "ts-morph";

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
