import { StateData } from "@elllphnt/elll-element";
import { Component } from "../../component";
import { Entity } from "../entity";

export abstract class State<D extends StateData = StateData> extends Entity<D> {
  constructor({
    id,
    component,
    type,
  }: {
    id?: string;
    component: Component;
    type: string;
  }) {
    super({
      id,
      component,
      type,
    });
  }

  remove(): void {
    this.component.removeState(this);
  }
}
