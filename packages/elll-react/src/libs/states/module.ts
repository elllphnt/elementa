import { ModuleStateData } from "@elllphnt/elll-element";
import { TranspilerContext, TranspilerResult } from "../../types/transpiler.js";

export function transpileModuleState(
  data: ModuleStateData,
  context: TranspilerContext,
): TranspilerResult {
  if (!data.moduleUrl) {
    console.warn(`No module URL provided for module state`);
    return {
      generate: () => {
        return `<>{/* No module URL provided for module state */}</>`;
      },
    };
  }

  const state = context.useDependency({
    url: data.moduleUrl,
    name: {
      capitalize: true,
    },
  });

  return {
    generate: (env) => {
      const stateName = env.getName(state.key);
      return `const ${data.name} = ${stateName}();`;
    },
  };
}
