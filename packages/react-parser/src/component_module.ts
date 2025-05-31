import { ComponentData } from "@elllphnt/elementa-base";
import { Node, Project, ScriptTarget, SyntaxKind } from "ts-morph";
import { parseComponent } from "./component";
import {
  extractImport,
  extractNamedResource,
  extractType,
  isStandaloneIdentifier,
  ModuleResourceDefinition,
  ResourceModule,
} from "./module";

export type ComponentResourceDefinition = {
  type: "component";
  component: ComponentData;
  dependencies: string[];
};
export type ComponentModule = ResourceModule<
  ModuleResourceDefinition<"hook"> | ComponentResourceDefinition
>;

export function parseComponentModule(code: string): ComponentModule {
  const project = new Project({
    compilerOptions: {
      target: ScriptTarget.ESNext,
      allowJs: true,
      jsx: 2,
    },
    useInMemoryFileSystem: true,
  });

  const file = project.createSourceFile("module.tsx", code, {
    overwrite: true,
  });

  const module: ComponentModule = {
    imports: {},
    types: {},
    resources: {},
  };

  const statements = file.getStatements();
  for (const statement of statements) {
    if (Node.isImportDeclaration(statement)) {
      extractImport(statement, module);
    } else if (
      Node.isTypeAliasDeclaration(statement) ||
      Node.isInterfaceDeclaration(statement) ||
      Node.isEnumDeclaration(statement)
    ) {
      extractType(statement, module);
    } else if (Node.isFunctionDeclaration(statement)) {
      const name = statement.getName();
      if (!name) continue;

      if (/^use[A-Z]/.test(name)) {
        extractNamedResource({
          node: statement,
          module: module as ResourceModule<ModuleResourceDefinition<"hook">>,
          type: "hook",
          name,
        });
      } else {
        const component = parseComponent(statement);
        const dependencies = extractDependencies(statement);
        if (component) {
          module.resources[name] = {
            type: "component",
            component,
            dependencies,
          };
        }
      }
    }
  }

  const exportDeclarations = file.getDefaultExportSymbol()?.getDeclarations();
  for (const exportDecl of exportDeclarations ?? []) {
    if (Node.isFunctionDeclaration(exportDecl)) {
      const name = exportDecl.getName();
      if (name) module.main = name;
    } else if (Node.isExportAssignment(exportDecl)) {
      const expr = exportDecl.getExpression();
      if (Node.isIdentifier(expr)) {
        module.main = expr.getText();
      } else {
        console.warn(
          "Anonymous default export not supported in ComponentModule."
        );
      }
    }
  }

  return module;
}

function extractDependencies(node: Node): string[] {
  const dependencies = new Set<string>();

  node.getDescendantsOfKind(SyntaxKind.Identifier).forEach((identifier) => {
    if (!isStandaloneIdentifier(identifier)) return;
    const defs = identifier.getDefinitionNodes();
    if (defs.length === 0) return;
    if (defs.some((d) => node.containsRange(d.getStart(), d.getEnd()))) return;
    dependencies.add(identifier.getText());
  });

  return Array.from(dependencies);
}
