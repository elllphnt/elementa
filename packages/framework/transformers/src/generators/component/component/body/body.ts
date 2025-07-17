import type { ComponentData } from "@elllphnt/elementa-base";
import { type FunctionDeclaration } from "ts-morph";
import type { GeneratorContext } from "~/generators/component/types.js";
import { generateElement } from "../../element/element.js";
import { generateFragment } from "./fragment.js";
import { generateState } from "./states.js";

export function generateComponentFunctionBody({
  node,
  data,
  context,
}: {
  node: FunctionDeclaration;
  data: ComponentData;
  context: GeneratorContext;
}) {
  // fragments
  const fragmentCodes =
    data.fragments?.map((fragmentData) =>
      generateFragment({ data: fragmentData, context }),
    ) ?? [];

  // states
  const stateCodes =
    data.states?.map((stateData) =>
      generateState({ data: stateData, context }),
    ) ?? [];

  // content
  const content =
    data.content
      ?.map((data) => generateElement({ data, context }))
      .join("\n") ?? `<></>`;

  node.addStatements([...fragmentCodes, ...stateCodes, `return ${content};`]);
}
