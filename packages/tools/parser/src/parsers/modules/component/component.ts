import { ComponentData } from "@elllphnt/elementa-base";
import { Node } from "ts-morph";
import { createReferenceString } from "../../../references.js";
import { GetStylesheet, parseComponent } from "../../component/_.js";
import { extractImportNew } from "../_shared/_.js";
import { isComponentName, isComponentNode } from "../code/_.js";
import { standardizeComponent } from "./standardize.js";
import { resolveDefaultExportValueNode } from "./utils/export.js";
import { createSingleFileProject } from "./utils/source_file.js";

function compileComponentModule({
  data,
  imports,
}: {
  data: ComponentData;
  imports: Record<string, [string, string]>;
  types: Record<string, string>;
}): ComponentData {
  function traverse(obj: any) {
    if (typeof obj === "object" && obj !== null) {
      for (const key in obj) {
        const value = obj[key];
        if (
          typeof value === "object" &&
          value !== null &&
          "__dependency" in value
        ) {
          const dependency = obj[key]["__dependency"];

          if (dependency in imports) {
            const [path, specifier] = imports[dependency];
            let adjustedPath = createReferenceString(path);
            if (specifier !== "default") {
              adjustedPath += `?specifier=${specifier}`;
            }
            obj[key] = adjustedPath;
          } else {
            throw new Error(
              `Dependency "${dependency}" not found in module imports or resources.`
            );
          }
        } else {
          traverse(obj[key]);
        }
      }
    }
  }
  traverse(data);

  return data;
}

export function parseComponentModule({
  sourceCode,
  getStylesheet,
}: {
  sourceCode: string;
  getStylesheet: GetStylesheet;
}) {
  const standardized = standardizeComponent(sourceCode);
  const { sourceFile } = createSingleFileProject(standardized, {
    name: "module.tsx",
  });
  const defaultExportNode = resolveDefaultExportValueNode(sourceFile);

  if (!defaultExportNode) {
    throw new Error("No default export found in component module.");
  }
  const { name, node } = defaultExportNode;
  if (!name || !isComponentName(name)) {
    throw new Error(
      `Default export does not have a valid component name. Found: ${name}.`
    );
  } else if (!isComponentNode(node)) {
    throw new Error(
      `Default export is not a valid component node. Found: ${node.getText()}.`
    );
  }

  const parsedComponent = parseComponent({ node, getStylesheet });
  const imports: Record<string, [string, string]> = {};
  const types: Record<string, string> = {};

  const statements = sourceFile.getStatements();
  for (const statement of statements) {
    if (Node.isImportDeclaration(statement)) {
      extractImportNew(statement, imports);
    } else if (
      Node.isTypeAliasDeclaration(statement) ||
      Node.isInterfaceDeclaration(statement) ||
      Node.isEnumDeclaration(statement)
    ) {
      const name = statement.getName();
      const source = statement.getText();
      types[name] = source;
    }
  }

  return compileComponentModule({
    data: parsedComponent,
    imports,
    types,
  });
}
