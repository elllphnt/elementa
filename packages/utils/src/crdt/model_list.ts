import * as y from "yjs";
import { assert } from "../core/assert.js";
import {
  Enhancer,
  isFromEnhancer,
  LooseEnhancer,
  setEnhancer,
} from "../core/enhancer.js";
import { attachReactiveList, ReactiveList } from "./list.js";

export function attachEnhancedReactiveList<T>(
  yarray: y.Array<any>,
  enhancer: LooseEnhancer,
  enhance: LooseEnhancer
): yarray is y.Array<any> & ReactiveList<T> {
  assert(attachReactiveList(yarray));

  const list = yarray as ReactiveList<T>;

  if (yarray.doc) {
    yarray.forEach((item) => {
      if (!isFromEnhancer(item, enhancer as Enhancer<any, any>)) {
        enhance(item);
      }
    });
  }

  list.items$.subscribe((items) => {
    items.forEach((item) => {
      if (!isFromEnhancer(item, enhancer as Enhancer<any, any>)) {
        enhance(item);
      }
    });
  });

  return setEnhancer(list, attachEnhancedReactiveList);
}
