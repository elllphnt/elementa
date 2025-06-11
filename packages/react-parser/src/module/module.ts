// parsed

export type ParsedResource<T extends string = string> = {
  type: T;
};
export type ParsedModule<R extends ParsedResource = ParsedResource> = {
  imports: Record<string, [string, string]>; // specifier alias -> [import path, specifier]
  types: Record<string, string>; // type name -> type definition
  utils: Record<string, string>;
  resources: Record<string, R>;
  main?: string;
};

// compiled

export type CompiledResource<T extends string> = {
  type: T;
  content: string;
};
export type CompiledModule<T extends string> = Record<
  string,
  CompiledResource<T>
>;

// compile

export function compileModule<R extends ParsedResource = ParsedResource>({
  module,
  compilers,
}: {
  module: ParsedModule<R>;
  compilers: Record<R["type"], (name: string, resource: R) => string>;
}): CompiledModule<R["type"]> {
  const resources: Record<string, CompiledResource<R["type"]>> = {};

  // build resources
  for (const [name, resource] of Object.entries(module.resources)) {
    const compile = compilers[resource.type as R["type"]];
    if (!compile) {
      throw new Error(`No generator found for resource type: ${resource.type}`);
    }

    resources[name] = {
      type: resource.type,
      content: compile(name, resource),
    };
  }

  return resources;
}
