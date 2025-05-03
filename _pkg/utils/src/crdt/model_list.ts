import * as y from "yjs";
import { Enhancer, isFromEnhancer } from "../core/enhancer";
import { attachReactiveList, ReactiveList } from "./list";

export function createEnhancedReactiveList<I, T extends y.Map<I>>(
  yarray: y.Array<I>,
  enhancer: Enhancer<y.Map<I>, T>,
  enhance: Enhancer<y.Map<I>, T>
): ReactiveList<T> {
  if (!attachReactiveList(yarray)) {
    throw new Error("Failed to attach reactive list");
  }
  const list = yarray as unknown as ReactiveList<T>;

  if (list.doc) {
    list.forEach((item) => {
      if (!isFromEnhancer(item, enhancer)) {
        enhance(item);
      }
    });
  }

  list.observable$.subscribe((items) => {
    items.forEach((item) => {
      if (!isFromEnhancer(item, enhancer)) {
        enhance(item);
      }
    });
  });

  return list;
}
