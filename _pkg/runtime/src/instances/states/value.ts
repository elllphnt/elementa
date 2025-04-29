import { ValueState } from "@elllphnt/elementa-models";
import { Runtime } from "../../runtime/runtime";
import { Instance } from "../instance";
import { StateInstance } from "./state";

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
