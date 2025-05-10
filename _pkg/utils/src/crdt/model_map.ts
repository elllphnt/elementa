import * as y from "yjs";
import { Enhancer, isFromEnhancer, LooseEnhancer } from "../core/enhancer";
import { attachReactiveMap, ReactiveMap } from "./map";

export function createEnhancedReactiveMap<I, T extends y.Map<I>>(
  ymap: y.Map<I>,
  enhancer: LooseEnhancer,
  enhance: LooseEnhancer
): ReactiveMap<Record<string, T>> {
  if (!attachReactiveMap(ymap)) {
    throw new Error("Failed to attach reactive map");
  }
  const map = ymap as any as ReactiveMap<Record<string, T>>;

  // Enhance existing entries
  if (map.doc) {
    Object.entries(map.values).forEach(([, value]) => {
      if (!isFromEnhancer(value, enhancer as Enhancer<any, any>)) {
        enhance(value);
      }
    });
  }

  // Reactively enhance new entries
  map.observable$.subscribe((entries) => {
    Object.entries(entries).forEach(([, value]) => {
      if (!isFromEnhancer(value, enhancer as Enhancer<any, any>)) {
        enhance(value);
      }
    });
  });

  return map;
}
