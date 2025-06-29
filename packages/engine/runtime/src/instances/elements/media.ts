import { MediaElement } from "@elllphnt/elementa-core";
import { Instance } from "../instance.js";
import { BaseElementInstance } from "./_base.js";
import { ElementRuntimeEnvironment } from "./_environment/environment.js";

export class MediaElementInstance<
  E extends MediaElement = MediaElement
> extends BaseElementInstance<E> {
  constructor({
    element,
    environment,
    parent,
  }: {
    element: E;
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
