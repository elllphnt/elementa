import { ElllModule, ModuleResourceType } from "./module";

export function generateImportStatements(
  importMap: Record<string, Record<string, string>>
): string {
  const lines: string[] = [];

  for (const [source, specifiers] of Object.entries(importMap)) {
    const namedImports: string[] = [];
    let defaultImport: string | undefined;
    let namespaceImport: string | undefined;

    for (const [specifier, alias] of Object.entries(specifiers)) {
      if (specifier === "default") {
        defaultImport = alias;
      } else if (specifier === "*") {
        namespaceImport = alias;
      } else {
        namedImports.push(
          specifier === alias ? specifier : `${specifier} as ${alias}`
        );
      }
    }

    let line = "import ";
    const parts: string[] = [];

    if (defaultImport) parts.push(defaultImport);
    if (namespaceImport) parts.push(`* as ${namespaceImport}`);
    if (namedImports.length) parts.push(`{ ${namedImports.join(", ")} }`);

    line += parts.join(", ") + ` from "${source}";`;
    lines.push(line);
  }

  return lines.join("\n");
}

function generateResourcePath(name: string, module: ElllModule): string {
  if (module.main === name) {
    return name;
  } else {
    const resource = module.resources[name];
    if (!resource) {
      throw new Error(`Resource ${name} not found in module.`);
    }
    switch (resource.type) {
      case "hook":
        return `hooks/${name}`;
      case "routine":
        return `routines/${name}`;
      case "context":
        return `contexts/${name}`;
      case "component":
        return `components/${name}`;
      default:
        throw new Error(`Unknown resource type: ${resource.type}`);
    }
  }
}

export type ModuleResourceSource = {
  name: string;
  type: ModuleResourceType;
  path: string;
  source: string;
};
export async function buildElllModule({
  module,
  createFile,
  resolveRelativePath,
}: {
  module: ElllModule;
  createFile: (resource: {
    name: string;
    path: string;
    type: ModuleResourceType;
  }) => Promise<string>;
  resolveRelativePath: (from: string, to: string) => string;
}): Promise<ModuleResourceSource[]> {
  const pathMap = Object.fromEntries(
    await Promise.all(
      Object.keys(module.resources).map(async (name) => {
        const resourcePath = generateResourcePath(name, module);
        const filePath = await createFile({
          name,
          path: resourcePath,
          type: module.resources[name].type,
        });
        return [name, filePath] as [string, string];
      })
    )
  );

  const resources: ModuleResourceSource[] = [];

  // build resources
  for (const [name, path] of Object.entries(pathMap)) {
    const resource = module.resources[name];
    if (!resource) {
      throw new Error(`Resource ${name} not found in module.`);
    }

    const imports: Record<string, Record<string, string>> = {};
    const typeDefs: string[] = [];

    for (const dep of resource.dependencies) {
      if (dep in module.imports) {
        const [path, specifier] = module.imports[dep];
        imports[path] = imports[path] || {};
        imports[path][specifier] = dep;
      } else if (dep in module.types) {
        typeDefs.push(module.types[dep]);
      } else if (dep in module.resources) {
        const depPath = pathMap[dep];
        const relativePath = resolveRelativePath(path, depPath);
        imports[relativePath] = imports[relativePath] || {};
        imports[relativePath]["default"] = dep;
      }
    }

    const source = [
      generateImportStatements(imports),
      ...typeDefs,
      resource.source,
    ].join("\n");

    resources.push({
      name,
      path,
      source,
      type: resource.type,
    });
  }

  return resources;
}
