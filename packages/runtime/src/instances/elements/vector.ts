import { VectorElement } from "@elllphnt/elementa-models";
import { FragmentEnvironment } from "../fragment/environment/environment.js";
import { Instance } from "../instance.js";
import { ElementInstance } from "./element.js";

export class VectorElementInstance extends ElementInstance<VectorElement> {
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
