import { type ComponentData } from "@elllphnt/elementa-base";
import type { Expression } from "ts-morph";
import { Node } from "ts-morph";
import { parseLiteral } from "~/libs/ts/literal.js";
import { componentMetadataSchema } from "../../libs/component/metadata.js";
import type { ResolvedExportNode } from "../../libs/ts/export.js";
import { resolveExportValueNodes } from "../../libs/ts/export.js";
import { createSingleFileProject } from "../../libs/ts/source_file.js";
import { parseComponentNode } from "./component/component.js";
import {
  getKeyframesFromCssModule,
  getStyleClassFromCssModule,
} from "./css/css.js";
import { parseCssModule } from "./css/module.js";
import { normalizeComponentModule } from "./normalization/module.js";

export function parseComponentModule(sourceCode: string): ComponentData {
  const normalizedCode = normalizeComponentModule(sourceCode);
  const { sourceFile } = createSingleFileProject(normalizedCode, {
    name: "module.tsx",
  });

  const exports = resolveExportValueNodes(sourceFile);

  let defaultExport: ResolvedExportNode | undefined = undefined;
  let stylesNode: ResolvedExportNode | undefined = undefined;
  let metadataNode: ResolvedExportNode | undefined = undefined;

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
    if (exportName === "metadata") {
      metadataNode = exprt;
    }
  }

  if (!defaultExport) {
    throw new Error("No default export found in component module.");
  }

  const metadata = metadataNode
    ? componentMetadataSchema.parse(
        parseLiteral(metadataNode.node as Expression),
      )
    : {};

  // styles
  const cssText = stylesNode
    ? extractCssTextFromValueNode(stylesNode.node)
    : "";
  const cssModule = parseCssModule(cssText);

  // component
  const componentName = defaultExport.names[defaultExport.names.length - 1];
  const componentData = parseComponentNode({
    node: defaultExport.node,
    init: {
      name: componentName,
      keyframes: getKeyframesFromCssModule(cssModule),
    },
    context: {
      getStyleClass: ({ id, classes }) => {
        return getStyleClassFromCssModule({
          id,
          classes,
          module: cssModule,
          getModifierDefinition: () => {
            return undefined;
          },
        });
      },
      getElementMeta: (id) => {
        return id ? metadata.elements?.[id] || {} : {};
      },
      isSystemModule: (module, name) => {
        console.log({ module, name });
        return module.endsWith(`/${name}`);
      },
    },
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
