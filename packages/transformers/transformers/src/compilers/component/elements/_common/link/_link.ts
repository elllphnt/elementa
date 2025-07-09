import type { LinkData } from "@elllphnt/elementa-base";
import { TranspilerDiagnosticLevel } from "~/types/diagnostic.js";
import type { TranspilerContext, TranspilerResult } from "~/types/transpiler.js";
import type { TranspileElementOptions } from "../../_base.js";
import { applyHrefLinkToTranspiledElement } from "./href.js";
import { applyRouteLinkToTranspiledElement } from "./router.js";

export function applyLinkToTranspiledElement(
  link: LinkData,
  element: TranspilerResult<[TranspileElementOptions]>,
  context: TranspilerContext
): TranspilerResult<[TranspileElementOptions]> {
  switch (link.type) {
    case "href":
      return applyHrefLinkToTranspiledElement(link, element, context);
    case "route":
      return applyRouteLinkToTranspiledElement(link, element, context);
    default:
      context.addDiagnostic?.({
        level: TranspilerDiagnosticLevel.Warning,
        message: `Unknown link type '${(link as any).type}'.`,
        data: link,
      });
      return element;
  }
}
