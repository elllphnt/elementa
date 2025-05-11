import { distinctUntilChanged, map, Observable } from "rxjs";
import * as y from "yjs";
import { ReactiveMap } from "./map";

let keyCounter = Math.round(Math.random() * 100000);
export function nextKey(): number {
  return keyCounter++;
}

export function getOrCreateYMap<T>(
  ymap: y.Map<any>,
  key: string,
  init?: Record<string, T>
): y.Map<T> {
  let map = ymap.doc ? ymap.get(key as string) : undefined;
  if (!map) {
    map = new y.Map(init ? Object.entries(init) : []);
    ymap.set(key as string, map);
  }
  return map;
}

export function getOrCreateYArray<T>(
  ymap: y.Map<any>,
  key: string
): y.Array<T> {
  let array = ymap.doc ? ymap.get(key as string) : undefined;
  if (!array) {
    array = new y.Array();
    ymap.set(key as string, array);
  }
  return array;
}

export function getOrCreateYText(
  ymap: y.Map<any>,
  key: string,
  init?: string
): y.Text {
  let text = ymap.doc ? ymap.get(key as string) : undefined;
  if (!text) {
    text = new y.Text(init);
    ymap.set(key as string, text);
  }
  return text;
}

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
  for (const [field, setter] of fields) {
    (rxMap as any)[setter] = (value: any) => {
      rxMap.set(field as any, value);
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

function applyValue({
  value,
  get,
  set,
}: {
  value: any;
  get: () => any;
  set: (value: any) => void;
}) {
  let currentValue = get();
  if (Array.isArray(value)) {
    if (currentValue && currentValue instanceof y.Array) {
      updateYArray(currentValue, value);
    } else {
      currentValue = new y.Array() as any;
      set(currentValue);
      updateYArray(currentValue, value);
    }
  } else if (typeof value === "object") {
    if (currentValue && currentValue instanceof y.Map) {
      updateYMap(currentValue, value);
    } else {
      currentValue = new y.Map() as any;
      set(currentValue);
      updateYMap(currentValue, value);
    }
  } else if (currentValue !== value) {
    set(value);
  }
}

export function updateYArray<T>(array: y.Array<T>, data: any[]) {
  for (let i = 0; i < data.length; i++) {
    const value = data[i];

    applyValue({
      value,
      get: () => array.get(i),
      set: (value) => {
        if (i < array.length) {
          array.delete(i);
        }
        array.insert(i, [value]);
      },
    });
  }

  if (data.length < array.length) {
    array.delete(data.length, array.length - data.length);
  }
}

export function updateYMap(map: y.Map<any>, data: any) {
  const deletedKey = new Set(map.keys());
  for (const key in data) {
    const value = data[key];
    deletedKey.delete(key);

    applyValue({
      value,
      get: () => map.get(key),
      set: (value) => {
        map.set(key, value);
      },
    });
  }

  for (const key of deletedKey) {
    map.delete(key);
  }
}
