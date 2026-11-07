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

export type ParseComponentModuleOptions = {
  /**
   * Resolves a side-effect stylesheet import (`import "./x.css"`) to its CSS
   * text. Without it, only the inline `styles`/`css` export is used.
   */
  readStyleImport?: (specifier: string) => string | undefined;
};

/** Side-effect imports of stylesheets, e.g. `import "./hero.component.css"`. */
export function getStyleImportSpecifiers(sourceCode: string): string[] {
  const { sourceFile } = createSingleFileProject(sourceCode, {
    name: "imports.tsx",
  });
  return sourceFile
    .getImportDeclarations()
    .filter((decl) => !decl.getImportClause())
    .map((decl) => decl.getModuleSpecifierValue())
    .filter((specifier) => specifier.endsWith(".css"));
}

export function parseComponentModule(
  sourceCode: string,
  { readStyleImport }: ParseComponentModuleOptions = {},
): ComponentData {
  // Read stylesheet imports from the original source, before normalization
  // has a chance to rewrite or drop them.
  const importedCss = readStyleImport
    ? getStyleImportSpecifiers(sourceCode)
        .map((specifier) => readStyleImport(specifier) ?? "")
        .join("\n")
    : "";

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
  const inlineCss = stylesNode
    ? extractCssTextFromValueNode(stylesNode.node)
    : "";
  // Imported sheets come first so the co-located `styles` export can
  // override them, matching source order in a bundler.
  const cssModule = parseCssModule([importedCss, inlineCss].join("\n"));

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
