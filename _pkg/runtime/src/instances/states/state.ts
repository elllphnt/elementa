import { State } from "@elllphnt/elementa-models";
import { Runtime } from "../../runtime/runtime";
import { Instance, InstanceType } from "../instance";

export abstract class StateInstance<S extends State = State> extends Instance {
  readonly state: S;

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
    super({ type: InstanceType.State, runtime, parent });
    this.state = state;
  }
}
