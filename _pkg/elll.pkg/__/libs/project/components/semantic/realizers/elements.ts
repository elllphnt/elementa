import { SemanticElementData } from "@elllphnt/elll-intelligence";
import { entityTypes, TextElementData } from "@repo/elementa";
import { baseElementRealizer } from "./_base";
import { setSemanticContextualValue } from "./_utils";

export function elementRealizer(
  data: SemanticElementData,
  { type }: { type?: string } = {},
) {
  return baseElementRealizer(data, {
    type: type ?? entityTypes.elements.container,
  });
}

export function vectorElementRealizer(data: SemanticElementData) {
  return elementRealizer(data, { type: entityTypes.elements.vector });
}

export function logoVectorElementRealizer(data: SemanticElementData) {
  const vector = vectorElementRealizer(data);
  switch (data.properties?.morph) {
    case "landscape":
      setSemanticContextualValue({
        target: vector.style!,
        key: "aspect-ratio",
        value: 16 / 9,
      });
      break;
    default:
      setSemanticContextualValue({
        target: vector.style!,
        key: "aspect-ratio",
        value: 1,
      });
      break;
  }

  return vector;
}

export function textElementRealizer(data: SemanticElementData) {
  const element = elementRealizer(data, {
    type: entityTypes.elements.text,
  }) as TextElementData;

  if (data.properties?.text) {
    element.content = data.properties.text;
  }

  return element;
}
