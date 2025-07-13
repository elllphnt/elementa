import type { ElementRepeatData } from "@elllphnt/elementa-base";
import { generateDynamic } from "../../misc/dynamic.js";

export function applyRepeat({
  repeat,
  content,
}: {
  repeat: ElementRepeatData;
  content: string;
}): string {
  const props: Record<string, string> = {};

  if (repeat.mode) {
    props["mode"] = `"${repeat.mode}"`;
  }
  if (repeat.count !== undefined) {
    props["count"] = generateDynamic(repeat.count);
  }
  if (repeat.dataset !== undefined) {
    props["dataset"] = generateDynamic(repeat.dataset);
  }
  if (repeat.alias) {
    props["alias"] = `"${repeat.alias}"`;
  }
  if (repeat.indexAlias) {
    props["indexAlias"] = `"${repeat.indexAlias}"`;
  }

  const propsCode = Object.entries(props)
    .map(([key, val]) => `${key}={${val}}`)
    .join(" ");

  return `<repeat ${propsCode}>${content}</repeat>`;
}
