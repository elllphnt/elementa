import { FragmentElement } from "@elllphnt/elementa-core";
import { Instance } from "../../instance.js";
import { BaseElementInstance } from "../_base.js";
import { ElementRuntimeEnvironment } from "../_environment/environment.js";

export class FragmentElementInstance extends BaseElementInstance<FragmentElement> {
  constructor({
    element,
    environment,
    parent,
  }: {
    element: FragmentElement;
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
