import * as y from "yjs";
import { Enhancer, isFromEnhancer } from "../core/enhancer";
import { attachReactiveMap, ReactiveMap } from "./map";

export function createEnhancedReactiveMap<T, I>(
  ymap: y.Map<I>,
  enhancer: Enhancer<T>,
  enhance: (input: I) => void
): ReactiveMap<Record<string, T>> {
  const map = attachReactiveMap<Record<string, T>>(ymap as unknown as y.Map<T>);

  // Enhance existing entries
  if (map.doc) {
    Object.entries(map.values).forEach(([_, value]) => {
      if (!isFromEnhancer(value, enhancer)) {
        enhance(value as I);
      }
    });
  }

  // Reactively enhance new entries
  map.observable$.subscribe((entries) => {
    Object.entries(entries).forEach(([_, value]) => {
      if (!isFromEnhancer(value, enhancer)) {
        enhance(value as I);
      }
    });
  });

  return map;
}
