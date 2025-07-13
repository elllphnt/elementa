import type {
  HookStateData,
  InlineStateData,
  StateData,
  ValueStateData,
} from "@elllphnt/elementa-base";
import type { GeneratorContext } from "~/generators/component/types.js";
import { generateDynamic } from "../../misc/dynamic.js";

export function generateValueState({
  data,
  context,
}: {
  data: ValueStateData;
  context: GeneratorContext;
}): string {
  const name = data.name;

  const useValueState = context.useImport({
    module: "elll",
    name: "useValueState",
  });

  const initValue = data.init ? generateDynamic(data.init) : undefined;
  return `const ${name} = ${useValueState}(${initValue});`;
}

export function generateHookState({
  data,
  context,
}: {
  data: HookStateData;
  context: GeneratorContext;
}): string {
  if (!data.hook) {
    return `/* Missing hook state: ${data.name} */`;
  }

  const hook = context.useImport(data.hook.__import);

  const args = generateDynamic(data.args);
  const expression = `${hook}(...${args})`;
  if (data.name) {
    return `const ${data.name} = ${expression};`;
  } else {
    return `${expression};`;
  }
}

export function generateInlineState({
  data,
}: {
  data: InlineStateData;
  context: GeneratorContext;
}): string {
  if (!data.script) {
    return `/* Missing inline state: ${data.name} */`;
  }

  const expression = `(() => { ${data.script} })()`;
  return data.name ? `const ${data.name} = ${expression};` : `${expression};`;
}

export function generateState({
  data,
  context,
}: {
  data: StateData;
  context: GeneratorContext;
}): string {
  switch (data.type) {
    case "value":
      return generateValueState({ data, context });
    case "hook":
      return generateHookState({ data, context });
    case "inline":
      return generateInlineState({ data, context });
    default:
      throw new Error(`Unsupported state type: ${(data as any).type}.`);
  }
}
