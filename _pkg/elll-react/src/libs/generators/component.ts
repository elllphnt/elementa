import { Generator } from "@elllphnt/elll-transpiler";
import _ from "lodash";
import nodePath from "path";
import { ImportMap, Namespace, transpileComponent } from "../_.js";
import { formatTypescript } from "../_lib/format.js";

function getModuleName(path: string) {
  const fileName = path.split("/").pop();
  if (!fileName) {
    return "Component";
  }

  const withoutExtension = _.camelCase(
    fileName.split(".").shift() || "Component",
  );
  const safeName = withoutExtension.replace(/[^a-zA-Z0-9]/g, "");
  return safeName;
}
function getOutPath(path: string) {
  if (!path.endsWith(".tsx")) {
    return path + ".tsx";
  } else {
    return path;
  }
}
function formatRelativeImport(path: string) {
  let finalPath = "" + path;
  if (!finalPath.startsWith(".")) {
    finalPath = "./" + finalPath;
  }
  if (finalPath.endsWith(".tsx")) {
    finalPath = finalPath.slice(0, -4);
  }
  if (finalPath.endsWith(".ts")) {
    finalPath = finalPath.slice(0, -3);
  }

  return finalPath;
}

export const generateComponent: Generator = async (file, context) => {
  const content = await context.readFileContent(file.id);
  let json = {};
  try {
    json = JSON.parse(content.trim() || "{}");
  } catch {
    throw new Error(`Failed to parse JSON: ${file.id}`);
  }

  const namespace = new Namespace();
  const importMap = new ImportMap({ namespace });

  const name = namespace.reserveName("component_name", {
    base: getModuleName(file.path),
    capitalize: true,
  });
  const outPath = getOutPath(file.path);
  const dirPath = nodePath.dirname(outPath);

  const { generate, dependencies, references } = transpileComponent(json);
  for (const dep of dependencies) {
    let depUrl: string;

    if (dep.url.startsWith("local:")) {
      const file = await context.resolveFile(dep.url);
      if (!file) {
        throw new Error(`File not found: ${dep.url}`);
      }

      const depOutPath = getOutPath(file.path);
      depUrl = formatRelativeImport(nodePath.relative(dirPath, depOutPath));
    } else {
      depUrl = dep.url;
    }

    importMap.import({
      ...dep,
      url: depUrl,
      name: {
        ...dep.name,
        base: getModuleName(depUrl),
      },
    });
  }
  const refValues: Map<number, any> = new Map();

  for (const ref of references) {
    switch (ref.data.type) {
      default: {
        refValues.set(ref.key, null);
      }
    }
  }

  const componentCode = generate({
    getName: (key) => {
      const name = namespace.getName(key);
      if (!name) {
        throw new Error(`Name for key not found: ${key}`);
      }
      return name;
    },
    getResolvedValue: (key) => {
      return refValues.get(key);
    },
  });
  const importCode = importMap.toCode();

  const code = [
    importCode,
    ``,
    `const ${name} = ${componentCode}`,
    ``,
    `export default ${name};`,
  ].join("\n");

  const formatted = await formatTypescript(code);

  return {
    files: [
      {
        path: outPath,
        content: formatted,
      },
    ],
  };
};
