import { MediaElement } from "@elllphnt/elementa-models";
import { FragmentEnvironment } from "../fragment/environment/environment.js";
import { Instance } from "../instance.js";
import { ElementInstance } from "./element.js";

export class MediaElementInstance<
  E extends MediaElement = MediaElement
> extends ElementInstance<E> {
  constructor({
    element,
    environment,
    parent,
  }: {
    element: E;
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
