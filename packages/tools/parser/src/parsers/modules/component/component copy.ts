import { Node } from "ts-morph";
import type { ParsedComponentModule } from "../../../module/component_module.js";
import { parseComponent } from "../../component/_.js";
import { extractImport } from "../_shared/_.js";
import {
  exportContent,
  extractContent,
  isComponentName,
  isComponentNode,
  isHookName,
} from "../code/_.js";
import {
  resolveDefaultExportValueNode,
  resolveRootValueNodes,
} from "./utils/export.js";
import { createSingleFileProject } from "./utils/source_file.js";

export function parseComponentModule({
  sourceCode,
}: // getStylesheet,
{
  sourceCode: string;
  // getStylesheet: GetStylesheet;
}) {
  const { sourceFile } = createSingleFileProject(sourceCode, {
    name: "module.tsx",
  });
  const valueNodes = resolveRootValueNodes(sourceFile);
  const defaultExportNode = resolveDefaultExportValueNode(sourceFile);

  const module: ParsedComponentModule = {
    imports: {},
    types: {},
    resources: {},
    utils: {},
    main: defaultExportNode?.name,
  };

  const statements = sourceFile.getStatements();
  for (const statement of statements) {
    if (Node.isImportDeclaration(statement)) {
      extractImport(statement, module);
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

  for (const { node, name } of valueNodes) {
    if (!name) continue;

    const { content, dependencies } = extractContent({ name, node });
    if (isHookName(name)) {
      module.resources[name] = {
        type: "hook",
        content: exportContent(name, content, true),
        dependencies,
      };
      continue;
    } else if (isComponentName(name) && isComponentNode(node)) {
      module.resources[name] = {
        type: "component",
        data: parseComponent({ node, getStylesheet: () => ({}) }),
      };
      continue;
    }
  }

  return module;
}
