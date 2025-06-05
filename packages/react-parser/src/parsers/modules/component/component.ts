import { Node, Project, ScriptTarget } from "ts-morph";
import { ParsedCodeResource } from "../../../module/code_module.js";
import { ParsedComponentModule } from "../../../module/component_module.js";
import { ParsedModule } from "../../../module/module.js";
import { GetStylesheet } from "../../component/_.js";
import { parseComponent } from "../../component/component.js";
import { extractImport } from "../_shared/import.js";
import { extractType } from "../_shared/type.js";
import { extractCodeResource } from "../code/code.js";

export function parseComponentModule({
  code,
  getStylesheet,
}: {
  code: string;
  getStylesheet: GetStylesheet;
}): ParsedComponentModule {
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
        const component = parseComponent({ node: statement, getStylesheet });
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
