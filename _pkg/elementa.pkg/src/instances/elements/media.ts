import { MediaElement } from "@repo/elementa-models";
import { FragmentEnvironment } from "../fragment/environment";
import { Instance } from "../instance";
import { ElementInstance } from "./element";

export class MediaElementInstance<
  E extends MediaElement = MediaElement,
> extends ElementInstance<E> {
  constructor({
    element,
    environment,
    parent,
  }: {
    element: E;
    environment: FragmentEnvironment;
    parent: Instance | null;
  }) {
    super({
      element,
      environment,
      parent,
    });

    this.addDisposer(() => {});
  }
}
