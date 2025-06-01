import { generateImportStatements } from "./_utils/import.js";
import { compileModule, ParsedModule, ParsedResource } from "./module.js";

export type CodeResourceType = "component" | "hook" | "context" | "routine";
export type ParsedCodeResource<T extends CodeResourceType = CodeResourceType> =
  ParsedResource<T> & {
    source: string;
    dependencies: string[];
  };
export type ParsedCodeModule = ParsedModule<ParsedCodeResource>;

export function compileCodeResource({
  module,
  resource,
  getResourcePath,
  getAdjustedPath,
}: {
  module: ParsedModule;
  resource: ParsedCodeResource;
  getResourcePath: (resource: string) => string;
  getAdjustedPath: (path: string) => string;
}): string {
  const imports: Record<string, Record<string, string>> = {};
  const typeDefs: string[] = [];

  for (const dep of resource.dependencies) {
    if (dep in module.imports) {
      const [path, specifier] = module.imports[dep];
      const adjustedPath = getAdjustedPath(path);
      imports[adjustedPath] = imports[adjustedPath] || {};
      imports[adjustedPath][specifier] = dep;
    } else if (dep in module.types) {
      typeDefs.push(module.types[dep]);
    } else if (dep in module.resources) {
      const path = getResourcePath(dep);
      imports[path] = imports[path] || {};
      imports[path]["default"] = dep;
    }
  }

  const source = [
    generateImportStatements(imports),
    ...typeDefs,
    resource.source,
  ].join("\n");

  return source;
}

export function compileCodeModule({
  module,
  getResourcePath: getRelativeResourcePath,
  getAdjustedPath: getRelativeAdjustedPath,
}: {
  module: ParsedCodeModule;
  getResourcePath: (fromResource: string, toResource: string) => string;
  getAdjustedPath: (fromResource: string, path: string) => string;
}) {
  const _compileCodeResource = (
    name: string,
    resource: ParsedCodeResource
  ): string => {
    return compileCodeResource({
      module,
      resource,
      getResourcePath: (resourceName: string) =>
        getRelativeResourcePath(name, resourceName),
      getAdjustedPath: (path: string) => getRelativeAdjustedPath(name, path),
    });
  };

  return compileModule({
    module,
    compilers: {
      component: _compileCodeResource,
      hook: _compileCodeResource,
      context: _compileCodeResource,
      routine: _compileCodeResource,
    },
  });
}
