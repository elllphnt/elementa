import * as y from "yjs";
import { assert } from "../core/assert.js";
import {
  Enhancer,
  isFromEnhancer,
  LooseEnhancer,
  setEnhancer,
} from "../core/enhancer.js";
import { attachReactiveMap, ReactiveMap } from "./map.js";

export function attachEnhancedReactiveMap<T>(
  ymap: y.Map<any>,
  enhancer: LooseEnhancer,
  enhance: LooseEnhancer
): ymap is y.Map<any> & ReactiveMap<Record<string, T>> {
  assert(attachReactiveMap(ymap));
  const map = ymap as ReactiveMap<Record<string, T>>;

  // Enhance existing entries
  if (ymap.doc) {
    Object.entries(ymap.values).forEach(([, value]) => {
      if (!isFromEnhancer(value, enhancer as Enhancer<any, any>)) {
        enhance(value);
      }
    });
  }

  // Reactively enhance new entries
  map.items$.subscribe((entries) => {
    Object.entries(entries).forEach(([, value]) => {
      if (!isFromEnhancer(value, enhancer as Enhancer<any, any>)) {
        enhance(value);
      }
    });
  });

  return setEnhancer(map, attachEnhancedReactiveMap);
}
