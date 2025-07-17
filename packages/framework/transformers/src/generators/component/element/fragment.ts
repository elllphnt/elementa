import type { FragmentElementData } from "@elllphnt/elementa-base";
import { generateDynamic } from "../misc/dynamic.js";

export function generatorFragmentElement(data: FragmentElementData): string {
  const fragmentId = data.fragmentId;

  if (!fragmentId) {
    return `<></>`;
  }

  const params = Object.entries(data.params || {}).map(([key, value]) => {
    return `${key}: ${generateDynamic(value)}`;
  });

  const paramsCode = params.join(", ");
  const fragmentExpression = `fragments["${fragmentId}"]({${paramsCode}})`;

  return `<>{${fragmentExpression}}</>`;
}
