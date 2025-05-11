import {
  ElementData,
  entityTypes,
  switchEntityType,
} from "@elllphnt/elll-element";
import { TranspilerContext, TranspilerResult } from "../../types/transpiler.js";
import { transpileComponentElement } from "./component.js";
import { transpileContainerElement } from "./container.js";
import { transpileMediaElement } from "./media.js";
import { compileCodeComponentElement } from "./primitive.js";
import { transpileSlotElement } from "./slot.js";
import { transpileTextElement } from "./text.js";

export function transpileElement(
  data: ElementData,
  context: TranspilerContext,
): TranspilerResult {
  return switchEntityType<TranspilerResult>(
    data.type,
    {
      [entityTypes.elements.container]: () => {
        return transpileContainerElement(data, context);
      },
      [entityTypes.elements.component]: () => {
        return transpileComponentElement(data, context);
      },
      [entityTypes.elements.slot]: () => {
        return transpileSlotElement(data, context);
      },
      [entityTypes.elements.primitive]: () => {
        return compileCodeComponentElement(data, context);
      },
      [entityTypes.elements.text]: () => {
        return transpileTextElement(data, context);
      },
      [entityTypes.elements.media]: () => {
        return transpileMediaElement(data, context);
      },
    },
    () => {
      console.warn(`Unknown element type: ${data.type}`);
      return {
        generate: () => `<>{/* Unknown element type: ${data.type} */}</>`,
      };
    },
  );
}
