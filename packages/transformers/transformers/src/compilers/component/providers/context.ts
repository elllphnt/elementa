import type { ContextProviderData } from "@elllphnt/elementa-base";
import { TranspilerDiagnosticLevel } from "~/types/diagnostic.js";
import type {
  TranspilerContext,
  TranspilerResult,
} from "../types/transpiler.js";
import { transpileDynamic } from "../libs/dynamic.js";

export function transpileContextProvider(
  data: ContextProviderData,
  context: TranspilerContext
): TranspilerResult<[children: TranspilerResult[]]> {
  if (!data.contextUrl) {
    context.addDiagnostic({
      level: TranspilerDiagnosticLevel.Warning,
      message: `No context URL provided for context provider.`,
    });

    return {
      generate: () => `<>{/* No context URL provided */}</>`,
    };
  }

  const value = transpileDynamic(data.value, context);

  const provider = context.useModule({
    url: data.contextUrl,
    name: {
      capitalize: true,
    },
  });

  return {
    generate: (env, children) => {
      const providerName = env.getModuleName(provider.key);
      return `<${providerName} value={${value.generate(env)}}>${children
        .map((child) => child.generate(env))
        .join("")}</${providerName}>`;
    },
  };
}
