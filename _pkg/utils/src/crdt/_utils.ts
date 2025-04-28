import * as y from "yjs";

export function getOrCreateYMap<T>(
  ymap: y.Map<any>,
  key: string,
  init?: Record<string, T>
): y.Map<T> {
  let map = ymap.get(key as string);
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
  let array = ymap.get(key as string);
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
  let text = ymap.get(key as string);
  if (!text) {
    text = new y.Text(init);
    ymap.set(key as string, text);
  }
  return text;
}
