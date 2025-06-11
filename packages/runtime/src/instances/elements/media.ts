import { MediaElement } from "@elllphnt/elementa-core";
import { FragmentEnvironment } from "../fragment/environment/environment.js";
import { Instance } from "../instance.js";
import { BaseElementInstance } from "./_base.js";

export class MediaElementInstance<
  E extends MediaElement = MediaElement
> extends BaseElementInstance<E> {
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
