import * as y from "yjs";

export function getOrCreateYMap(ymap: y.Map<any>, key: string): y.Map<any> {
  let map = ymap.get(key as string);
  if (!map) {
    map = new y.Map();
    ymap.set(key as string, map);
  }
  return map;
}

export function getOrCreateYArray(ymap: y.Map<any>, key: string): y.Array<any> {
  let array = ymap.get(key as string);
  if (!array) {
    array = new y.Array();
    ymap.set(key as string, array);
  }
  return array;
}

export function getOrCreateYText(ymap: y.Map<any>, key: string): y.Text {
  let text = ymap.get(key as string);
  if (!text) {
    text = new y.Text();
    ymap.set(key as string, text);
  }
  return text;
}
