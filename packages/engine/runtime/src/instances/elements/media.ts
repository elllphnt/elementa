import type { MediaElement } from "@elllphnt/elementa-models";
import type { Instance } from "../instance.js";
import { BaseElementInstance } from "./_base.js";
import type { ElementRuntimeEnvironment } from "./_environment/environment.js";

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
