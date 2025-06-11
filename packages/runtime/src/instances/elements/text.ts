import { TextElement } from "@elllphnt/elementa-core";
import { FragmentEnvironment } from "../fragment/environment/environment.js";
import { Instance } from "../instance.js";
import { BaseElementInstance } from "./_base.js";

export class TextElementInstance extends BaseElementInstance<TextElement> {
  constructor({
    element,
    environment,
    parent,
  }: {
    element: TextElement;
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
