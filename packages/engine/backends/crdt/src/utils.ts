import * as y from "yjs";

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
