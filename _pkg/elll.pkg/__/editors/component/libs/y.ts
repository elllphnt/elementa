import { Component } from "@repo/elementa";
import * as Y from "yjs";

export type YWidget = Y.Map<{}>;

export function bindYWidgetList(list: Y.Array<YWidget>, component: Component) {
  list.observe((event) => {
    event.changes.delta.forEach((change) => {});
  });
}
export function bindYComponent(doc: Y.Doc, component: Component) {
  const widgets = doc.getArray("widgets");
}

Y;
