import type { Runtime } from "../runtime/runtime.js";
import { Instance } from "./instance.js";

export abstract class ModelInstance<M> extends Instance {
  readonly model: M;

  constructor({
    type,
    runtime,
    parent,
    model,
  }: {
    model: M;
    type: string;
    runtime: Runtime;
    parent?: Instance;
  }) {
    super({
      type,
      runtime,
      parent,
    });
    this.model = model;
  }
}
