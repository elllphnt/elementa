import type { ComponentData } from "@elllphnt/elementa-base";
import { Project } from "ts-morph";
import { generateComponentFunction } from "./component/component.js";
import type { UseImport } from "./types.js";

export function generateComponentModule(data: ComponentData): string {
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
    const usedName = useName(data.alias || data.name || "name");
    if (!imports[data.module]) {
      imports[data.module] = {};
    }
    imports[data.module][data.name || "default"] = usedName;
    return usedName;
  };

  const componentName = data.name || "Component";
  generateComponentFunction({
    name: componentName,
    sourceFile,
    data,
    context: {
      useImport,
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

  sourceFile.addExportAssignment({
    isExportEquals: false,
    expression: componentName,
  });

  sourceFile.formatText({
    indentSize: 2,
    convertTabsToSpaces: true,
  });

  return sourceFile.getFullText();
}
