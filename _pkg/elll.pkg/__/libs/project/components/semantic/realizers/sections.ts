import { SemanticElementData } from "@elllphnt/elll-intelligence";
import { entityTypes } from "@repo/elementa";
import { baseElementRealizer } from "./_base";

export function sectionRealizer(data: SemanticElementData) {
  return baseElementRealizer(data, { type: entityTypes.elements.container });
}
