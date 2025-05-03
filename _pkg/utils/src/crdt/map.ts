import { BehaviorSubject, Observable } from "rxjs";
import * as y from "yjs";
import { setEnhancer } from "../core/enhancer";
import { nextKey, updateYMap } from "./_utils";

export type ReactiveMap<T extends object = object> = y.Map<unknown> & {
  key: number;
  observable$: Observable<T>;
  restore(data: T): void;
  dispose(): void;
};

export function attachReactiveMap<T extends object>(
  ymap: y.Map<unknown>
): ymap is ReactiveMap<T> {
  const rxMap = ymap as ReactiveMap<T>;
  // initialize subject
  const initial: Record<string, unknown> = {};
  if (ymap.doc) {
    for (const [key, value] of ymap.entries()) {
      initial[key] = value;
    }
  }
  const subject$ = new BehaviorSubject<T>(initial as T);

  // observe crdt
  const observer = (event: y.YMapEvent<unknown>) => {
    const current = { ...subject$.value };
    for (const [key, change] of event.changes.keys.entries()) {
      if (change.action === "add" || change.action === "update") {
        (current as Record<string, unknown>)[key] = ymap.get(key);
      } else if (change.action === "delete") {
        delete current[key];
      }
    }
    subject$.next(current as T);
  };
  ymap.observe(observer);

  // attach API
  rxMap.key = nextKey();
  rxMap.observable$ = subject$.asObservable();
  rxMap.dispose = () => {
    ymap.unobserve(observer);
    subject$.complete();
  };

  rxMap.restore = (data: T): void => {
    updateYMap(ymap, data);
  };

  setEnhancer(rxMap, attachReactiveMap);
  return true;
}

export function createReactiveMap<T extends Record<string, unknown>>(
  init?: T
): ReactiveMap<T> {
  const ymap = new y.Map<unknown>(Object.entries(init || {}));
  if (attachReactiveMap<T>(ymap)) {
    return ymap;
  } else {
    throw new Error("Failed to attach reactive map");
  }
}
