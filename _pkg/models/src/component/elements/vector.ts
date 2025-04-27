import { VectorElementData, VectorNodeData } from "@elllphnt/elementa-base";
import { map } from "rxjs";
import * as y from "yjs";
import { Component } from "../component";
import { Element } from "./element";

export class VectorElement extends Element<VectorElementData> {
  get content() {
    return this.state.content;
  }
  get content$() {
    return this.state$.pipe(map((s) => s.content));
  }

  constructor(ymap: y.Map<any>, component: Component) {
    super(ymap, component);
  }

  cloneIds(clone: y.Map<any>): void {
    this.cloneOwnId(clone);
  }

  setContent(content: VectorNodeData[]) {
    this.patch({ content });
  }
}
