import * as y from "yjs";
import { Enhancer, isFromEnhancer } from "../core/enhancer";
import { attachReactiveList, ReactiveList } from "./list";

export function createEnhancedReactiveList<T, I>(
  yarray: y.Array<I>,
  enhancer: Enhancer<T>,
  enhance: (input: I) => void
): ReactiveList<T> {
  const list = attachReactiveList<T>(yarray as unknown as y.Array<T>);

  if (list.doc) {
    list.forEach((item) => {
      if (!isFromEnhancer(item, enhancer)) {
        enhance(item as I);
      }
    });
  }

  list.observable$.subscribe((items) => {
    items.forEach((item) => {
      if (!isFromEnhancer(item, enhancer)) {
        enhance(item as I);
      }
    });
  });

  return list;
}
