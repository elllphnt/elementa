import {
  FunctionDeclaration,
  Node,
  Project,
  ScriptTarget,
  SyntaxKind,
  VariableStatement,
} from "ts-morph";
import {
  CodeResourceType,
  ParsedCodeModule,
  ParsedCodeResource,
} from "../../../module/code_module";
import { ParsedModule } from "../../../module/module";
import { extractImport } from "../_shared/import";
import { isStandaloneIdentifier } from "./_utils/identifier";

export function parseCodeModule(code: string): ParsedCodeModule {
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

  const module: ParsedCodeModule = {
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
export function extractResource(
  node: FunctionDeclaration | VariableStatement,
  module: ParsedCodeModule
) {
  const name = Node.isFunctionDeclaration(node)
    ? node.getName()
    : node.getDeclarations()[0]?.getName();

  if (!name) return;

  // Hook: useXxx
  if (/^use[A-Z]/.test(name)) {
    extractCodeResource({ type: "hook", name, node, module });
  } else if (/^[A-Z][a-zA-Z0-9]*Context$/.test(name)) {
    extractCodeResource({ type: "context", name, node, module });
  } else if (/^[A-Z]/.test(name)) {
    extractCodeResource({ type: "component", name, node, module });
  } else {
    extractCodeResource({ type: "routine", name, node, module });
  }
}
export function extractCodeResource<T extends CodeResourceType>({
  type,
  name,
  node,
  module,
}: {
  type: T;
  name: string;
  node: Node;
  module: ParsedModule<ParsedCodeResource<T>>;
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
