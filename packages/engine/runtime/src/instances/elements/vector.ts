import type { VectorElement } from "@elllphnt/elementa-models";
import type { Instance } from "../instance.js";
import { BaseElementInstance } from "./_base.js";
import type { ElementRuntimeEnvironment } from "./_environment/environment.js";

export class VectorElementInstance extends BaseElementInstance<VectorElement> {
  constructor({
    element,
    environment,
    parent,
  }: {
    element: VectorElement;
    environment: ElementRuntimeEnvironment;
    parent?: Instance;
  }) {
    super({
      element,
      environment,
      parent,
    });
  }
}
