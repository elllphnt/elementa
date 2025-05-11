import { ValueState } from "@elllphnt/elementa-models";
import { Runtime } from "../../runtime/runtime.js";
import { Instance } from "../instance.js";
import { StateInstance } from "./state.js";

export class ValueStateInstance extends StateInstance<ValueState> {
  constructor({
    state,
    runtime,
    parent,
  }: {
    state: ValueState;
    runtime: Runtime;
    parent?: Instance;
  }) {
    super({ state, runtime, parent });
  }
}
