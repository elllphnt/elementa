import {
  ElementData,
  OverflowValue,
  PageElementData,
} from "@elllphnt/elll-element";
import { TranspilerContext, TranspilerResult } from "../../types/transpiler.js";
import { transpileContainerElement } from "./container.js";

export function transpilePageElement(
  data: PageElementData & {
    content?: ElementData[];
    viewportOverflow?: OverflowValue;
  },
  context: TranspilerContext,
): TranspilerResult {
  return transpileContainerElement(data, context);
}
