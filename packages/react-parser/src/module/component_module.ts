import { ComponentData } from "@elllphnt/elementa-base";
import { compileCodeResource, ParsedCodeResource } from "./code_module.js";
import { compileModule, ParsedModule, ParsedResource } from "./module.js";

export type ParsedComponentResource = ParsedResource<"component"> & {
  data: ComponentData;
};
export type ParsedComponentModule = ParsedModule<
  ParsedCodeResource<"hook"> | ParsedComponentResource
>;

export function compileComponentResource({
  module,
  resource,
  getAdjustedPath,
  getResourcePath,
}: {
  module: ParsedModule;
  resource: ParsedComponentResource;
  getAdjustedPath: (path: string) => string;
  getResourcePath: (resource: string) => string;
}): string {
  const data = JSON.parse(JSON.stringify(resource.data));

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

          if (dependency in module.imports) {
            const [path, specifier] = module.imports[dependency];
            if (specifier !== "default") {
              throw new Error(
                `Unexpected import specifier "${specifier}" for dependency "${dependency}". Expected "default".`
              );
            }
            obj[key] = getAdjustedPath(path);
          } else if (dependency in module.resources) {
            obj[key] = getResourcePath(dependency);
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

  return JSON.stringify(data, null, 2);
}

export function compileComponentModule({
  module,
  getResourcePath: getRelativeResourcePath,
  getAdjustedPath: getRelativeAdjustedPath,
}: {
  module: ParsedComponentModule;
  getResourcePath: (fromResource: string, toResource: string) => string;
  getAdjustedPath: (fromResource: string, path: string) => string;
}) {
  const _compileComponentResource = (
    name: string,
    resource: ParsedComponentResource
  ): string => {
    return compileComponentResource({
      module,
      resource,
      getResourcePath: (resourceName: string) =>
        getRelativeResourcePath(name, resourceName),
      getAdjustedPath: (path: string) => getRelativeAdjustedPath(name, path),
    });
  };

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
      component: _compileComponentResource as any,
      hook: _compileCodeResource as any,
    },
  });
}
