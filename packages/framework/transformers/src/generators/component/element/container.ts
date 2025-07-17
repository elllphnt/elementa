import type { ContainerElementData } from "@elllphnt/elementa-base";
import type { GeneratorContext } from "~/generators/component/types.js";
import { generatorBaseElement } from "./base.js";
import { generateElement } from "./element.js";

export function generatorContainerElement(
  data: ContainerElementData,
  context: GeneratorContext,
): string {
  const children =
    data.content?.map((child) => generateElement({ data: child, context })) ??
    [];

  return generatorBaseElement({
    tag: "div",
    content: children,
    data,
  });
}
