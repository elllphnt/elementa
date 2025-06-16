import { compileCodeModule } from "../module/code_module.js";
import { compileComponentModule } from "../module/component_module.js";
import { CompiledModule } from "../module/module.js";
import {
  parseCodeModule,
  parseComponentModule,
  standardizeComponent,
} from "../parsers/_.js";

export type ElllResource = {
  name: string;
  type: string;
  content: string;
};

export function compileToElll({
  tsx,
  css = "",
  resourcePrefix = "!/",
}: {
  tsx: string;
  css?: string;
  resourcePrefix?: string;
}): CompiledModule<string> {
  const parsedCodeModule = parseCodeModule({ sourceCode: tsx });
  const resources = compileCodeModule({
    module: parsedCodeModule,
    getAdjustedPath: (_, path) => path,
    getResourcePath: (_, toResource) => resourcePrefix + toResource,
  });
  // transpile component resources to ELLL format
  for (const [name, resource] of Object.entries(resources)) {
    if (resource.type !== "component") continue;
    delete resources[name];
    const standardized = standardizeComponent(resource.content);
    const parsedComponentModule = parseComponentModule({
      sourceCode: standardized,
    });
    const makeSubName = (sub: string) => `${name}/${sub}`;
    const subResources = compileComponentModule({
      module: parsedComponentModule,
      getAdjustedPath: (_, path) => path,
      getResourcePath: (_, toResource) =>
        resourcePrefix + makeSubName(toResource),
    });
    for (const [subName, subResource] of Object.entries(subResources)) {
      const key = `${makeSubName(subName)}`;
      resources[key] = subResource;
    }
  }

  return resources;
}
