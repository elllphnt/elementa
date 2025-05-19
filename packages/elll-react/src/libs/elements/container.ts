import { ContainerElementData } from "@elllphnt/elementa-base";
import { TranspilerContext, TranspilerResult } from "~/types/transpiler.js";
import { transpileBaseElement, TranspileElementOptions } from "./_base.js";
import { transpileElement } from "./element.js";

export function transpileContainerElement(
  data: ContainerElementData,
  context: TranspilerContext
): TranspilerResult<[TranspileElementOptions]> {
  const base = transpileBaseElement(data, context);

  const children =
    data.content?.map((child) => transpileElement(child, context)) ?? [];

  return {
    generate: (env, upstream) => {
      return base.generate(env, {
        ...upstream,
        tag: upstream.tag ?? "div",
        children: [...(upstream.children ?? []), ...children],
      });
    },
  };
}
