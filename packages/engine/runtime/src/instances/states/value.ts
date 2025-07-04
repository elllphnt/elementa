import type { ValueState } from "@elllphnt/elementa-models";
import type { Runtime } from "../../runtime/runtime.js";
import type { Instance } from "../instance.js";
import { BaseStateInstance } from "./_base.js";

export class ValueStateInstance extends BaseStateInstance<ValueState> {
  constructor({
    model,
    runtime,
    parent,
  }: {
    model: ValueState;
    runtime: Runtime;
    parent?: Instance;
  }) {
    super({ model, runtime, parent });
  }
}
