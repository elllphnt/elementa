import { SemanticElementData } from "@elllphnt/elll-intelligence";
import { entityTypes } from "@repo/elementa";
import { baseElementRealizer } from "./_base";

export function pageRealizer(data: SemanticElementData) {
  return baseElementRealizer(data, { type: entityTypes.elements.container });
}
