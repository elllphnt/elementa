import type { Evaluable } from "@elllphnt/elementa-base";
import { generateDynamic } from "../../misc/dynamic.js";

export function applyCondition({
  condition,
  content,
}: {
  condition: Evaluable<boolean>;
  content: string;
}): string {
  const conditionCode = generateDynamic(condition);
  return `<show when={${conditionCode}}>${content}</show>`;
}
