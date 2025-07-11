import type {
  ComponentData,
  TsTypeDeclarationLike,
} from "@elllphnt/elementa-base";
import {
  tsEnumDeclarationFromNode,
  tsInterfaceDeclarationFromNode,
  tsTypeFromTypeNode,
} from "@elllphnt/elementa-transformer-primitives";
import { Node } from "ts-morph";
import type { ResolvedExportNode } from "../../libs/ts/export.js";
import { resolveExportValueNodes } from "../../libs/ts/export.js";
import { createSingleFileProject } from "../../libs/ts/source_file.js";
import { parseComponentNode } from "./component/component.js";
import { parseStyleSheet } from "./css/css.js";
import { normalizeComponentModule } from "./normalization/module.js";

export function parseComponentModule(sourceCode: string): ComponentData {
  const normalizedCode = normalizeComponentModule(sourceCode);
  const { sourceFile } = createSingleFileProject(normalizedCode, {
    name: "module.tsx",
  });

  const exports = resolveExportValueNodes(sourceFile);

  let defaultExport: ResolvedExportNode | undefined = undefined;
  let stylesNode: ResolvedExportNode | undefined = undefined;

  // exports

  for (const exprt of exports) {
    const { isDefault, names } = exprt;
    const exportName = names[0];
    if (isDefault) {
      defaultExport = exprt;
    }
    if (exportName === "styles" || exportName === "css") {
      stylesNode = exprt;
    }
  }

  // types

  const types: TsTypeDeclarationLike[] = [];
  for (const type of sourceFile.getTypeAliases()) {
    const name = type.getName();
    const typeNode = type.getTypeNodeOrThrow().compilerNode;
    types.push({
      kind: "alias",
      name,
      type: tsTypeFromTypeNode(typeNode),
      typeParameters: type.getTypeParameters().map((tp) => {
        const constraint = tp.getConstraint();
        const defaultType = tp.getDefault();
        return {
          name: tp.getName(),
          constraint: constraint
            ? tsTypeFromTypeNode(constraint.compilerNode)
            : undefined,
          default: defaultType
            ? tsTypeFromTypeNode(defaultType.compilerNode)
            : undefined,
        };
      }),
    });
  }
  for (const interfaceDecl of sourceFile.getInterfaces()) {
    const typeNode = interfaceDecl.compilerNode;
    types.push(tsInterfaceDeclarationFromNode(typeNode));
  }
  for (const enumDecl of sourceFile.getEnums()) {
    const typeNode = enumDecl.compilerNode;
    types.push(tsEnumDeclarationFromNode(typeNode));
  }

  if (!defaultExport) {
    throw new Error("No default export found in component module.");
  }

  // styles
  const cssText = stylesNode
    ? extractCssTextFromValueNode(stylesNode.node)
    : "";
  const stylesheet = parseStyleSheet(cssText);

  // component
  const componentName = defaultExport.names[defaultExport.names.length - 1];
  const componentData = parseComponentNode({
    node: defaultExport.node,
    init: { name: componentName, stylesheet },
  });

  return componentData;
}

function extractCssTextFromValueNode(node: Node): string {
  if (Node.isStringLiteral(node)) {
    return node.getLiteralText();
  } else if (Node.isNoSubstitutionTemplateLiteral(node)) {
    return node.getLiteralText();
  } else {
    throw new Error(
      `Styles export is not a string literal or template literal. Found: ${node.getText()}.`,
    );
  }
}
