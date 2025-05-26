import { distinctUntilChanged, map, Observable } from "rxjs";
import * as y from "yjs";
import { ReactiveMap } from "./map.js";

export function setReactiveMapGetters<
  T extends Record<string, any>,
  K extends keyof T & string
>(
  rxMap: y.Map<any> & ReactiveMap<T>,
  fields: K[]
): rxMap is y.Map<any> &
  ReactiveMap<T> & {
    [key in K]: T[key];
  } & {
    [key in `${K}$`]: key extends `${infer F}$` ? Observable<T[F]> : never;
  } {
  for (const field of fields) {
    Object.defineProperty(rxMap, field, {
      get() {
        return rxMap.get(field as any);
      },
    });

    (rxMap as any)[`${field as string}$`] = rxMap.items$.pipe(
      map((v) => v[field]),
      distinctUntilChanged()
    );
  }
  return true;
}

export function setReactiveMapSetters<
  T extends Record<string, any>,
  F extends [string, keyof T][]
>(
  rxMap: y.Map<any> & ReactiveMap<T>,
  fields: F
): rxMap is y.Map<any> &
  ReactiveMap<T> & {
    [key in F[number][0]]: (value: T[keyof T]) => void;
  } {
  for (const [methodName, yKey] of fields) {
    (rxMap as any)[methodName] = (value: any) => {
      rxMap.set(yKey as any, value); // ✅ correct key
    };
  }
  return true;
}

export function setObjectProperty<K extends string, V>(
  obj: any,
  key: K,
  value: V
): obj is {
  [key in K]: V;
} {
  obj[key] = value;
  return true;
}

export function setObjectGetter<K extends string, V>(
  obj: any,
  key: K,
  value: () => V
): obj is {
  [key in K]: V;
} {
  Object.defineProperty(obj, key, {
    get: value,
  });
  return true;
}
