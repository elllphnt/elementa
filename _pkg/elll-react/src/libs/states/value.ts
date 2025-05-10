import { ValueStateData } from "@elllphnt/elll-element";
import { TranspilerContext, TranspilerResult } from "../../types/transpiler.js";

export function transpileValueState(
  data: ValueStateData,
  context: TranspilerContext,
): TranspilerResult {
  const name = data.name;
  if (!name) {
    console.warn(`Value state missing name`);
    return {
      generate: () => `<>{/* Value state missing name */}</>`,
    };
  }

  const elllDependency = context.useDependency({
    url: "elll",
    specifier: "useValueState",
    name: {
      base: "useValueState",
    },
  });

  return {
    generate: (env) => {
      const reactName = env.getName(elllDependency.key);
      return `const ${name} = ${reactName}();`;
    },
  };
}
