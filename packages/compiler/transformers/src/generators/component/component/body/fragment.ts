import type { FragmentData } from "@elllphnt/elementa-base";
import type { GeneratorContext } from "~/generators/component/types.js";
import { printTypeNode, typeToTypeNode } from "~/libs/types.js";
import { generateElement } from "../../element/element.js";
import { applyProvider } from "../../providers/provider.js";

export function generateFragment({
  data,
  context,
}: {
  data: FragmentData;
  context: GeneratorContext;
}): string {
  let content =
    data.content
      ?.map((data) => generateElement({ data, context }))
      .join("\n") ?? `<></>`;

  const providers = data.providers ?? [];
  for (let i = providers.length - 1; i >= 0; i--) {
    content = applyProvider({
      data: providers[i],
      context,
      content,
    });
  }

  const paramsTypeNode = data.params
    ? typeToTypeNode({ type: data.params, useImport: context.useImport })
    : undefined;
  const params = paramsTypeNode ? printTypeNode(paramsTypeNode) : "any";

  return `__defineFragment("${data.id}", (params: ${params}) => ${content})`;
}
