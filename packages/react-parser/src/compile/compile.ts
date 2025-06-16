import { compileComponentModule } from "../module/component_module.js";

export type ElllResource = {
  name: string;
  type: string;
  content: string;
};

export function compileComponentModuleToElll({ source }: { source: string }) {
  const subResources = compileComponentModule({
    module: parsedComponentModule,
    getAdjustedPath: (_, path) => path,
    getResourcePath: (_, toResource) =>
      resourcePrefix + makeSubName(toResource),
  });
}
