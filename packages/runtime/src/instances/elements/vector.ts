import { VectorElement } from "@elllphnt/elementa-core";
import { FragmentEnvironment } from "../fragment/environment/environment.js";
import { Instance } from "../instance.js";
import { BaseElementInstance } from "./_base.js";

export class VectorElementInstance extends BaseElementInstance<VectorElement> {
  constructor({
    element,
    environment,
    parent,
  }: {
    element: VectorElement;
    environment: FragmentEnvironment;
    parent?: Instance;
  }) {
    super({
      element,
      environment,
      parent,
    });
  }
}
