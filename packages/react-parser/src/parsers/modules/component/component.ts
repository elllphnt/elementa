import { Node, Project, ScriptTarget } from "ts-morph";
import { ParsedCodeResource } from "../../../module/code_module";
import { ParsedComponentModule } from "../../../module/component_module";
import { ParsedModule } from "../../../module/module";
import { parseComponent } from "../../component/component";
import { extractImport } from "../_shared/import";
import { extractType } from "../_shared/type";
import { extractCodeResource } from "../code/code";

export function parseComponentModule(code: string): ParsedComponentModule {
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

  const module: ParsedComponentModule = {
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
        extractCodeResource({
          node: statement,
          module: module as ParsedModule<ParsedCodeResource<"hook">>,
          type: "hook",
          name,
        });
      } else {
        const component = parseComponent(statement);
        if (component) {
          module.resources[name] = {
            type: "component",
            data: component,
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
