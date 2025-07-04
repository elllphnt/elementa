import type { InlineState } from "@elllphnt/elementa-models";
import type { Runtime } from "../../runtime/runtime.js";
import type { Instance } from "../instance.js";
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
