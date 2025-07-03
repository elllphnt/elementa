import type { VectorElementRenderable } from "@elllphnt/elementa-scene";
import type { Handle } from "~/handles/handle.js";
import type { ElementaInteractor } from "~/interactor.js";
import { BaseElementHandle } from "./_base.js";

export class VectorElementHandle extends BaseElementHandle<VectorElementRenderable> {
  constructor({
    renderable,
    interactor,
    parent,
  }: {
    renderable: VectorElementRenderable;
    interactor: ElementaInteractor;
    parent: Handle | null;
  }) {
    super({ renderable, interactor, parent });

    this.addEventListener("dblclick", () => {
      // const componentId = this.entity.component.id;
      // const entityId = this.entity.id;
      // const part = "content";
      // this.editor.host.goTo(
      //   `elementaentity:${componentId}/${entityId}/${part}`,
      // );
    });
  }
}
