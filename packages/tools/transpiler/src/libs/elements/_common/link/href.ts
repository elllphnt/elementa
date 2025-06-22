import { HrefLinkData } from "@elllphnt/elementa-base";
import { transpileDynamic } from "~/libs/dynamic.js";
import { TranspilerContext, TranspilerResult } from "~/types/transpiler.js";
import { TranspileElementOptions } from "../../_base.js";
import { applyBaseLinkToTranspiledElement } from "./_base.js";

export function applyHrefLinkToTranspiledElement(
  link: HrefLinkData,
  element: TranspilerResult<[TranspileElementOptions]>,
  context: TranspilerContext
): TranspilerResult<[TranspileElementOptions]> {
  const props: Record<string, TranspilerResult> = {};

  if (link.href) {
    props["href"] = transpileDynamic(link.href, context);
  }
  if (link.hreflang) {
    props["hreflang"] = transpileDynamic(link.hreflang, context);
  }
  if (link.ping) {
    props["ping"] = transpileDynamic(link.ping, context);
  }
  if (link.referrerPolicy) {
    props["referrerPolicy"] = transpileDynamic(link.referrerPolicy, context);
  }
  if (link.rel) {
    props["rel"] = transpileDynamic(link.rel, context);
  }
  if (link.target) {
    props["target"] = transpileDynamic(link.target, context);
  }

  const wrapped = applyBaseLinkToTranspiledElement(link, element, context);

  return {
    generate: (env, elementUpstream) =>
      wrapped.generate(env, elementUpstream, {
        tag: "a",
        props,
      }),
  };
}
