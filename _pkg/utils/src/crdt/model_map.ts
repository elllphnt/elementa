import * as y from "yjs";
import { Enhancer, isFromEnhancer } from "../core/enhancer";
import { attachReactiveMap, ReactiveMap } from "./map";

export function createEnhancedReactiveMap<I, T extends y.Map<I>>(
  ymap: y.Map<I>,
  enhancer: Enhancer<y.Map<I>, T>,
  enhance: Enhancer<y.Map<I>, T>
): ReactiveMap<Record<string, T>> {
  if (!attachReactiveMap(ymap)) {
    throw new Error("Failed to attach reactive map");
  }
  const map = ymap as unknown as ReactiveMap<Record<string, T>>;

  // Enhance existing entries
  if (map.doc) {
    Object.entries(map.values).forEach(([_, value]) => {
      if (!isFromEnhancer(value, enhancer)) {
        enhance(value);
      }
    });
  }

  // Reactively enhance new entries
  map.observable$.subscribe((entries) => {
    Object.entries(entries).forEach(([_, value]) => {
      if (!isFromEnhancer(value, enhancer)) {
        enhance(value);
      }
    });
  });

  return map;
}
