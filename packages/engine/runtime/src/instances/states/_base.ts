import { BaseStateData } from "@elllphnt/elementa-base";
import { BaseState } from "@elllphnt/elementa-models";
import { Runtime } from "../../runtime/runtime.js";
import { ElementaInstanceType, Instance } from "../instance.js";
import { ModelInstance } from "../model.js";

export abstract class BaseStateInstance<
  S extends BaseState<BaseStateData<string>>
> extends ModelInstance<S> {
  get namespaceKey() {
    return `!!state-${this.key}`;
  }

  constructor({
    model,
    runtime,
    parent,
  }: {
    model: S;
    runtime: Runtime;
    parent?: Instance;
  }) {
    super({ model, type: ElementaInstanceType.State, runtime, parent });
  }
}
