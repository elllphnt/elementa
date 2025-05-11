import { StateData } from "@elllphnt/elll-element";
import { ComponentCompilerContext } from "../types/component.js";

export function compileState(
  data: StateData,
  context: ComponentCompilerContext
): string {
  if (!data.moduleUrl) return "";
  return context.useModule(data.moduleUrl, { default: true });
}
