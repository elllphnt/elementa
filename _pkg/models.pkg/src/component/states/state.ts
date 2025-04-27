import { StateData } from "@elllphnt/elll-element";
import * as y from "yjs";
import { Component } from "../component";
import { IdentifiableModel } from "../identifiable";

export abstract class State<
  D extends StateData = StateData,
> extends IdentifiableModel<D> {
  readonly component: Component;

  get type() {
    return this.state.type;
  }

  constructor(ymap: y.Map<any>, component: Component) {
    super(ymap);
    this.component = component;
  }

  remove(): void {
    this.component.states.remove(this);
  }
}
