import { TextElement } from "@elllphnt/elementa-models";
import { FragmentEnvironment } from "../fragment/environment/environment";
import { Instance } from "../instance";
import { ElementInstance } from "./element";

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
