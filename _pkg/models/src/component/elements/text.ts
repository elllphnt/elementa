import { TextElementData } from "@elllphnt/elementa-base";
import { map } from "rxjs";
import * as y from "yjs";
import { Component } from "../component";
import { Element } from "./element";

export class TextElement extends Element<TextElementData> {
  get text() {
    return this.state.text;
  }
  get text$() {
    return this.state$.pipe(map((s) => s.text));
  }

  constructor(ymap: y.Map<any>, component: Component) {
    super(ymap, component);
  }

  cloneIds(clone: y.Map<any>): void {
    this.cloneOwnId(clone);
  }

  setText(text: string | undefined) {
    this.patch({ text });
  }
}
