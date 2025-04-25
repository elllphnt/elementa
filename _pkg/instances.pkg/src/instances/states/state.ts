import { State } from "@repo/elementa-models";
import { Elementa } from "../../elementa";
import { Instance } from "../instance";

export abstract class StateInstance<
  E extends State = State,
> extends Instance<E> {
  get namespaceKey() {
    return `!!state-${this.key}`;
  }

  constructor({
    entity,
    elementa,
    parent,
  }: {
    entity: E;
    elementa: Elementa;
    parent: Instance | null;
  }) {
    super({ entity, elementa, parent });
  }
}
