// @core/map_crdt_model.ts
import { BehaviorSubject, Observable } from "rxjs";
import * as y from "yjs";
import { setEnhancer } from "../core/enhancer";
import { nextKey } from "./_utils";

export type ReactiveMap<T extends Record<string, any>> = y.Map<T[keyof T]> & {
  key: number;
  observable$: Observable<T>;
  dispose(): void;
};

export function attachReactiveMap<T extends Record<string, any>>(
  ymap: y.Map<T[keyof T]>
): ReactiveMap<T> {
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

  setEnhancer(rxMap, attachReactiveMap);
  return rxMap;
}

export function createReactiveMap<T extends Record<string, any>>(
  init?: T
): ReactiveMap<T> {
  return attachReactiveMap(
    new y.Map<T[keyof T]>(init ? Object.entries(init) : undefined)
  );
}
