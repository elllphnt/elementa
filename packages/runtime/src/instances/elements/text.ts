import { TextElement } from "@elllphnt/elementa-models";
import { FragmentEnvironment } from "../fragment/environment/environment.js";
import { Instance } from "../instance.js";
import { ElementInstance } from "./element.js";

export class TextElementInstance extends ElementInstance<TextElement> {
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
