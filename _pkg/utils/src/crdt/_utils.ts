import { distinctUntilChanged, map } from "rxjs";
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

export function setModelFields<T extends Record<string, any>>(
  rxMap: ReactiveMap<T>,
  fields: (keyof T)[]
) {
  for (const field of fields) {
    Object.defineProperty(rxMap, field, {
      get() {
        return rxMap.get(field as any);
      },
      set(value) {
        rxMap.set(field as any, value);
      },
    });

    rxMap[`${field as string}$`] = rxMap.observable$.pipe(
      map((v) => v[field]),
      distinctUntilChanged()
    );
  }

  return rxMap;
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
  let deletedKey = new Set(map.keys());
  for (let key in data) {
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

  for (let key of deletedKey) {
    map.delete(key);
  }
}
