import { TextElement } from "@elllphnt/elementa-core";
import { Instance } from "../instance.js";
import { BaseElementInstance } from "./_base.js";
import { ElementRuntimeEnvironment } from "./_environment/environment.js";

export class TextElementInstance extends BaseElementInstance<TextElement> {
  constructor({
    element,
    environment,
    parent,
  }: {
    element: TextElement;
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
