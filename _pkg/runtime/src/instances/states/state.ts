import { State } from "@elllphnt/elementa-models";
import { Runtime } from "../../runtime/runtime.js";
import { ElementaInstanceType, Instance } from "../instance.js";

export abstract class StateInstance<S extends State = State> extends Instance {
  readonly model: S;

  get namespaceKey() {
    return `!!state-${this.key}`;
  }

  constructor({
    state,
    runtime,
    parent,
  }: {
    state: S;
    runtime: Runtime;
    parent?: Instance;
  }) {
    super({ type: ElementaInstanceType.State, runtime, parent });
    this.model = state;
  }
}
