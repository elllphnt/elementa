import { BehaviorSubject, Observable } from "rxjs";
import * as y from "yjs";
import { assert } from "../core/assert";
import { setEnhancer } from "../core/enhancer";
import { nextKey, setObjectGetter, setObjectProperty } from "./_utils";

export type ReactiveMap<T extends object = object> = {
  key: number;
  items: T;
  items$: Observable<T>;
  dispose(): void;
};

export function attachReactiveMap<T extends object>(
  rxMap: y.Map<any>
): rxMap is y.Map<any> & ReactiveMap<T> {
  // initialize subject
  const initial: Record<string, any> = {};
  if (rxMap.doc) {
    for (const [key, value] of rxMap.entries()) {
      initial[key] = value;
    }
  }
  const subject$ = new BehaviorSubject<T>(initial as T);

  // observe crdt
  const observer = (event: y.YMapEvent<any>) => {
    const current = { ...subject$.value };
    for (const [key, change] of event.changes.keys.entries()) {
      if (change.action === "add" || change.action === "update") {
        (current as Record<string, any>)[key] = rxMap.get(key);
      } else if (change.action === "delete") {
        delete (current as any)[key];
      }
    }
    subject$.next(current as T);
  };
  rxMap.observe(observer);

  // attach API
  assert(setObjectProperty(rxMap, "key", nextKey()));
  assert(setObjectProperty(rxMap, "items$", subject$));
  assert(
    setObjectGetter(rxMap, "items", () => {
      const data: Record<string, any> = {};
      for (const [key, value] of rxMap.entries()) {
        data[key] = value;
      }
      return data as T;
    })
  );
  assert(
    setObjectProperty(rxMap, "dispose", () => {
      rxMap.unobserve(observer);
      subject$.complete();
    })
  );

  return setEnhancer<ReactiveMap<T>>(rxMap, attachReactiveMap);
}
