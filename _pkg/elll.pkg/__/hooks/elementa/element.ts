import { ElementInstance } from "@repo/elementa";

export function useElementStyles(elements: ElementInstance[]) {
  return elements.map((element) => element.style);
}
