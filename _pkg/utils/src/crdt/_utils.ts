import { distinctUntilChanged, map } from "rxjs";
import * as y from "yjs";
import { setEnhancer } from "../core/enhancer";
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

  setEnhancer(rxMap, setModelFields);
  return rxMap;
}
