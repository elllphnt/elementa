import { BehaviorSubject, Observable } from "rxjs";
import * as y from "yjs";
import { setEnhancer } from "../core/enhancer";
import { nextKey, updateYMap } from "./_utils";

export type ReactiveMap<T extends Record<string, any>> = y.Map<T[keyof T]> & {
  key: number;
  observable$: Observable<T>;
  restore(data: T): void;
  dispose(): void;
};

export function attachReactiveMap<T extends Record<string, any>>(
  ymap: y.Map<T[keyof T]>
): ymap is ReactiveMap<T> {
  const rxMap = ymap as ReactiveMap<T>;
  // initialize subject
  const initial: any = {};
  if (ymap.doc) {
    for (const [key, value] of ymap.entries()) {
      initial[key] = value;
    }
  }
  const subject$ = new BehaviorSubject<T>(initial as T);

  // observe crdt
  const observer = (event: y.YMapEvent<any>) => {
    const current = { ...subject$.value };
    for (const [key, change] of event.changes.keys.entries()) {
      if (change.action === "add" || change.action === "update") {
        (current as any)[key] = ymap.get(key);
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
  const originalDispose = (ymap as any).dispose?.bind(ymap);
  rxMap.dispose = () => {
    ymap.unobserve(observer);
    subject$.complete();
    originalDispose?.();
  };

  rxMap.restore = (data: T): void => {
    updateYMap(ymap, data);
  };

  setEnhancer(rxMap, attachReactiveMap);
  return true;
}

export function createReactiveMap<T extends Record<string, any>>(
  init?: T
): ReactiveMap<T> {
  const ymap = new y.Map<T[keyof T]>(Object.entries(init || {}));
  if (attachReactiveMap(ymap)) {
    return ymap;
  } else {
    throw new Error("Failed to attach reactive map");
  }
}
