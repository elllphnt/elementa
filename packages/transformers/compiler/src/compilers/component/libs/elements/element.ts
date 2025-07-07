import type { ElementData } from "@elllphnt/elementa-base";
import type {
  TranspilerContext,
  TranspilerResult,
} from "../../types/transpiler.js";
import type { TranspileElementOptions } from "./_base.js";
import { applyConditionToTranspiledElement } from "./_common/condition.js";
import { applyLinkToTranspiledElement } from "./_common/link/_link.js";
import { applyRepeatToTranspiledElement } from "./_common/repeat.js";
import { transpileComponentElement } from "./component.js";
import { transpileContainerElement } from "./container.js";
import { transpileExpressionElement } from "./expression.js";
import { transpileFragmentElement } from "./fragment.js";
import { transpileMediaElement } from "./media.js";
import { transpilePrimitiveElement } from "./primitive.js";
import { transpileSlotElement } from "./slot.js";
import { transpileTextElement } from "./text.js";
import { transpileVectorElement } from "./vector.js";

export function transpileElementVariant(
  data: ElementData,
  context: TranspilerContext
): TranspilerResult<[TranspileElementOptions]> {
  switch (data.type) {
    case "container":
      return transpileContainerElement(data, context);
    case "component":
      return transpileComponentElement(data, context);
    case "slot":
      return transpileSlotElement(data, context);
    case "primitive":
      return transpilePrimitiveElement(data, context);
    case "text":
      return transpileTextElement(data, context);
    case "media":
      return transpileMediaElement(data, context);
    case "vector":
      return transpileVectorElement(data, context);
    case "fragment":
      return transpileFragmentElement(data, context);
    case "expression":
      return transpileExpressionElement(data, context);
    default:
      throw new Error(`Unknown element type: ${(data as any).type}`);
  }
}

export function transpileElement(
  data: ElementData,
  context: TranspilerContext
): TranspilerResult {
  let element: TranspilerResult<[TranspileElementOptions]> =
    transpileElementVariant(data, context);

  if (data.link) {
    element = applyLinkToTranspiledElement(data.link, element, context);
  }
  if (data.repeat) {
    element = applyRepeatToTranspiledElement(data.repeat, element, context);
  }
  if (data.condition) {
    element = applyConditionToTranspiledElement(
      data.condition,
      element,
      context
    );
  }

  return {
    generate: (env) =>
      element.generate(env, {
        tag: data.tag,
      }),
  };
}
