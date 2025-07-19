import type { ComponentData, StyleClassData } from "@elllphnt/elementa-base";
import { Project } from "ts-morph";
import { IndentStyle } from "typescript";
import type {
  ComponentMetadata,
  ElementMetadata,
} from "~/libs/component/metadata.js";
import { snakeCase } from "~/libs/identifier.js";
import { generateComponentFunction } from "./component/component.js";
import { sanitizeNode } from "./sanitize.js";
import { generateCssStylesheet } from "./style/style.js";
import type { UseElementMetadata, UseImport, UseStyleClass } from "./types.js";

export function generateComponentModule({
  data,
  systemPackage,
}: {
  data: ComponentData;
  systemPackage: string;
}): string {
  const project = new Project();

  const sourceFile = project.createSourceFile("component.tsx", "");
  const imports: Record<string, Record<string, string>> = {};
  const namespace = new Set<string>();

  function useName(name: string): string {
    if (namespace.has(name)) {
      let counter = 1;
      let newName = `${name}${counter}`;
      while (namespace.has(newName)) {
        counter++;
        newName = `${name}${counter}`;
      }
      namespace.add(newName);
      return newName;
    } else {
      namespace.add(name);
      return name;
    }
  }

  const useImport: UseImport = function (data) {
    if (!imports[data.module]) {
      imports[data.module] = {};
    }

    const moduleName = data.module;
    const symbolName = data.name || "default";
    let alias = imports[moduleName][symbolName];

    if (!alias) {
      alias = useName(data.alias || data.name || "name");
      imports[moduleName][symbolName] = alias;
    }

    return alias;
  };

  const elementMetadata: Record<string, ElementMetadata> = {};
  const useElementMetadata: UseElementMetadata = function ({
    tag,
    ...metadata
  }) {
    let baseId;
    let id;
    let counter = 0;

    if (metadata.name) {
      baseId = snakeCase(metadata.name);
      id = baseId;
    } else {
      baseId = snakeCase(tag || "element");
      id = `${baseId}_${++counter}`;
    }

    while (elementMetadata[id]) {
      id = `${baseId}_${++counter}`;
    }
    elementMetadata[id] = metadata;
    return [`"${id}"`, id];
  };

  const styleClasses: Record<string, StyleClassData> = {};
  const useStyleClass: UseStyleClass = function (id, styleClass) {
    if (styleClasses[id]) {
      throw new Error(`Style class with id "${id}" already exists.`);
    }
    styleClasses[id] = styleClass;

    const conditions = Object.entries(styleClass.conditions || {})
      .map(([name, condition]) => {
        return `"${name}": ${condition}`;
      })
      .join(", ");

    if (conditions.length) {
      return `{${conditions}}`;
    }
  };

  const componentName = data.name || "Component";
  generateComponentFunction({
    name: componentName,
    sourceFile,
    data,
    context: {
      useImport,
      useElementMetadata,
      useStyleClass,
      getSystemModule: (name) => `${systemPackage}/${name}`,
    },
  });

  // Add imports to the source file
  Object.entries(imports).forEach(([module, names]) => {
    const importDeclaration = sourceFile.addImportDeclaration({
      moduleSpecifier: module,
    });

    Object.entries(names).forEach(([name, alias]) => {
      importDeclaration.addNamedImport({
        name,
        alias: name === alias ? undefined : alias,
      });
    });
  });

  // css
  const css = generateCssStylesheet({
    styleClasses,
    keyframes: data.keyframes ?? [],
    getModifierDefinition: () => undefined,
  });
  sourceFile.addVariableStatement({
    isExported: true,
    declarations: [
      {
        name: "css",
        initializer: `\`\n${css}\n\``,
      },
    ],
  });

  // metadata
  const metadata: ComponentMetadata = {
    elements: elementMetadata,
  };
  sourceFile.addVariableStatement({
    isExported: true,
    declarations: [
      {
        name: "metadata",
        initializer: JSON.stringify(metadata, null, 2),
      },
    ],
  });

  sourceFile.addExportAssignment({
    isExportEquals: false,
    expression: componentName,
  });

  sanitizeNode(sourceFile);

  sourceFile.formatText({
    indentSize: 2,
    convertTabsToSpaces: true,
    indentStyle: IndentStyle.Smart,
    trimTrailingWhitespace: true,
  });

  return sourceFile.getFullText();
}
