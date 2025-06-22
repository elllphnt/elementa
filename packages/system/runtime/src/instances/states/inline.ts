import { InlineState } from "@elllphnt/elementa-core";
import { Runtime } from "../../runtime/runtime.js";
import { Instance } from "../instance.js";
import { BaseStateInstance } from "./_base.js";

export class InlineStateInstance extends BaseStateInstance<InlineState> {
  constructor({
    model,
    runtime,
    parent,
  }: {
    model: InlineState;
    runtime: Runtime;
    parent?: Instance;
  }) {
    super({ model, runtime, parent });
  }
}
