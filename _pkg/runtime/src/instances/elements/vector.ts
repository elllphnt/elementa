import { VectorElement } from "@elllphnt/elementa-models";
import { FragmentEnvironment } from "../fragment/environment/environment";
import { Instance } from "../instance";
import { ElementInstance } from "./element";

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
