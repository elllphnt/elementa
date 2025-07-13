import type { ContextProviderData } from "@elllphnt/elementa-base";
import type { GeneratorContext } from "~/generators/component/types.js";
import { generateDynamic } from "../misc/dynamic.js";

export function applyContextProvider({
  data,
  context,
  content,
}: {
  data: ContextProviderData;
  context: GeneratorContext;
  content: string;
}): string {
  if (!data.context) {
    return `<>{/* No context URL provided */}</>`;
  }

  const value = generateDynamic(data.value);
  const provider = context.useImport(data.context.__import);

  return [`<${provider} value={${value}}>`, content, `</${provider}>`].join(
    "\n",
  );
}

export function applyProvider({
  data,
  context,
  content,
}: {
  data: ContextProviderData;
  context: GeneratorContext;
  content: string;
}): string {
  switch (data.type) {
    case "context":
      return applyContextProvider({ data, context, content });
    default:
      throw new Error(`Unsupported provider type: ${(data as any).type}.`);
  }
}
