import type { ExpressionElement } from "@elllphnt/elementa-models";
import type { Instance } from "../instance.js";
import { BaseElementInstance } from "./_base.js";
import type { ElementRuntimeEnvironment } from "./_environment/environment.js";

export class ExpressionElementInstance extends BaseElementInstance<ExpressionElement> {
  constructor({
    element,
    environment,
    parent,
  }: {
    element: ExpressionElement;
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
