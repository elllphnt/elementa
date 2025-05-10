import * as y from "yjs";
import { Enhancer, isFromEnhancer, LooseEnhancer } from "../core/enhancer";
import { attachReactiveList, ReactiveList } from "./list";

export function createEnhancedReactiveList<I, T extends y.Map<I>>(
  yarray: y.Array<I>,
  enhancer: LooseEnhancer,
  enhance: LooseEnhancer
): ReactiveList<T> {
  if (!attachReactiveList(yarray)) {
    throw new Error("Failed to attach reactive list");
  }
  const list = yarray as any as ReactiveList<T>;

  if (list.doc) {
    list.forEach((item) => {
      if (!isFromEnhancer(item, enhancer as Enhancer<any, any>)) {
        enhance(item);
      }
    });
  }

  list.observable$.subscribe((items) => {
    items.forEach((item) => {
      if (!isFromEnhancer(item, enhancer as Enhancer<any, any>)) {
        enhance(item);
      }
    });
  });

  return list;
}
