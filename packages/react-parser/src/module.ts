import {
  EnumDeclaration,
  FunctionDeclaration,
  Identifier,
  ImportDeclaration,
  InterfaceDeclaration,
  Node,
  Project,
  ScriptTarget,
  SyntaxKind,
  TypeAliasDeclaration,
  VariableStatement,
} from "ts-morph";

export function isStandaloneIdentifier(identifier: Identifier): boolean {
  const parent = identifier.getParent();

  // If it's part of a property access like obj.prop
  if (Node.isPropertyAccessExpression(parent)) {
    return parent.getChildAtIndex(0) === identifier;
  }

  return true;
}

export type ResourceDefinition<T extends string = string> = {
  type: T;
  dependencies: string[];
};
export type ModuleResourceType = "component" | "hook" | "context" | "routine";
export type ModuleResourceDefinition<T extends string> = {
  type: T;
  source: string;
  dependencies: string[];
};
export type ResourceModule<R extends ResourceDefinition = ResourceDefinition> =
  {
    imports: Record<string, Record<string, string>>; // import path -> specifier -> specifier alias
    types: Record<string, string>; // type name -> type definition
    resources: Record<string, R>;
    main?: string;
  };
export type ElllModule = ResourceModule<
  ModuleResourceDefinition<ModuleResourceType>
>;

export function parseElllModule(code: string): ElllModule {
  const project = new Project({
    compilerOptions: {
      target: ScriptTarget.ESNext,
      allowJs: true,
      jsx: 2, // React
    },
    useInMemoryFileSystem: true,
  });

  const file = project.createSourceFile("module.tsx", code, {
    overwrite: true,
  });

  const module: ElllModule = {
    imports: {},
    types: {},
    resources: {},
  };

  const statements = file.getStatements();
  for (const statement of statements) {
    if (Node.isImportDeclaration(statement)) {
      extractImport(statement, module);
    } else if (
      Node.isFunctionDeclaration(statement) ||
      Node.isVariableStatement(statement)
    ) {
      extractResource(statement, module);
    } else if (
      Node.isTypeAliasDeclaration(statement) ||
      Node.isInterfaceDeclaration(statement) ||
      Node.isEnumDeclaration(statement)
    ) {
      const name = statement.getName();
      const source = statement.getText();
      module.types[name] = source;
    }
  }

  const exportDeclarations = file.getDefaultExportSymbol()?.getDeclarations();
  for (const exportDeclaration of exportDeclarations ?? []) {
    if (Node.isFunctionDeclaration(exportDeclaration)) {
      const name = exportDeclaration.getName();
      if (name) {
        module.main = name;
      }
    } else if (Node.isVariableStatement(exportDeclaration)) {
      const declarations = exportDeclaration.getDeclarations();
      if (declarations.length > 0) {
        const name = declarations[0].getName();
        if (name) {
          module.main = name;
        }
      }
    } else if (Node.isExportAssignment(exportDeclaration)) {
      const expression = exportDeclaration.getExpression();
      if (Node.isIdentifier(expression)) {
        module.main = expression.getText();
      } else if (Node.isArrowFunction(expression)) {
        console.warn("Anonymous export default expressions are not supported.");
      }
    }
  }

  return module;
}
export function extractType(
  statement: TypeAliasDeclaration | InterfaceDeclaration | EnumDeclaration,
  module: ResourceModule
) {
  const name = statement.getName();
  const source = statement.getText();
  const cleanedSource = source.replace(/\bexport\s+/, "");
  module.types[name] = `export ${cleanedSource}`;
}
export function extractImport(
  statement: ImportDeclaration,
  module: ResourceModule
) {
  const moduleSpecifier = statement.getModuleSpecifierValue();
  if (!moduleSpecifier) return;

  const namedBindings = statement.getImportClause()?.getNamedBindings();
  const defaultImport = statement.getImportClause()?.getDefaultImport();
  const imports: Record<string, string> = {};

  // Handle default import: import React from "react"
  if (defaultImport) {
    const name = defaultImport.getText();
    imports["default"] = name;
  }

  // Handle named imports: import { useState, useEffect as ue } from "react"
  if (Node.isNamedImports(namedBindings)) {
    for (const element of namedBindings.getElements()) {
      const name = element.getNameNode().getText();
      const alias = element.getAliasNode()?.getText() ?? name;
      imports[name] = alias;
    }
  }

  // Handle namespace import: import * as React from "react"
  if (Node.isNamespaceImport(namedBindings)) {
    const alias = namedBindings.getName();
    imports["*"] = alias;
  }

  if (Object.keys(imports).length > 0) {
    module.imports[moduleSpecifier] = imports;
  }
}
export function extractResource(
  node: FunctionDeclaration | VariableStatement,
  module: ElllModule
) {
  const name = Node.isFunctionDeclaration(node)
    ? node.getName()
    : node.getDeclarations()[0]?.getName();

  if (!name) return;

  // Hook: useXxx
  if (/^use[A-Z]/.test(name)) {
    extractNamedResource({ type: "hook", name, node, module });
  } else if (/^[A-Z][a-zA-Z0-9]*Context$/.test(name)) {
    extractNamedResource({ type: "context", name, node, module });
  } else if (/^[A-Z]/.test(name)) {
    extractNamedResource({ type: "component", name, node, module });
  } else {
    extractNamedResource({ type: "routine", name, node, module });
  }
}
export function extractNamedResource<T extends string>({
  type,
  name,
  node,
  module,
}: {
  type: T;
  name: string;
  node: Node;
  module: ResourceModule<ModuleResourceDefinition<T>>;
}) {
  const dependencies = new Set<string>();

  node.getDescendantsOfKind(SyntaxKind.Identifier).forEach((identifier) => {
    if (!isStandaloneIdentifier(identifier)) return;
    const definitions = identifier.getDefinitionNodes();
    if (definitions.length === 0) return;
    if (definitions.some((d) => node.containsRange(d.getStart(), d.getEnd())))
      return;
    dependencies.add(identifier.getText());
  });

  const rawSource = node.getText();
  const cleanedSource = rawSource
    .replace(/\bexport\s+default\s+/, "") // handles: export default function...
    .replace(/\bexport\s+/, "") // handles: export function...
    .replace(/\bdefault\s+/, ""); // just in case it's standalone

  const source = Node.isVariableStatement(node)
    ? [cleanedSource, `export default ${name};`].join("\n")
    : `export default ${cleanedSource};`;

  module.resources[name] = {
    type,
    source,
    dependencies: Array.from(dependencies),
  };
}
