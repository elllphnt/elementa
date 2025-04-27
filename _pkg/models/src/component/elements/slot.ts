import { SlotElementData } from "@elllphnt/elementa-base";
import { getOrCreateYArray } from "@elllphnt/elementa-utils";
import * as y from "yjs";
import { Component } from "../component";
import { ElementList } from "./_list";
import { Element } from "./element";

export class SlotElement extends Element<SlotElementData> {
  readonly placeholder: ElementList;

  constructor(ymap: y.Map<any>, component: Component) {
    super(ymap, component);
    this.placeholder = new ElementList(
      this.getOrCreateArray("placeholder"),
      component
    );

    this.addDisposer(() => {
      this.placeholder.dispose();
    });
  }

  cloneIds(clone: y.Map<any>): void {
    this.cloneOwnId(clone);
    this.placeholder.cloneIds(getOrCreateYArray(clone, "placeholder"));
  }
}
