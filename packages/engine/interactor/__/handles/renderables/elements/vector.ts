import { VectorElementRenderable } from "@elllphnt/elementa-scene";
import { Handle } from "~/_types/_";
import { IFragmentHandle } from "~/_types/handles/renderable/fragment";
import { ElementHandle } from "./element.js";

export class VectorElementHandle extends ElementHandle<VectorElementRenderable> {
  constructor({
    renderable,
    fragment,
    parent,
  }: {
    renderable: VectorElementRenderable;
    fragment: IFragmentHandle;
    parent: Handle | null;
  }) {
    super({ renderable, fragment, parent });

    this.addEventListener("dblclick", () => {
      const componentId = this.entity.component.id;
      const entityId = this.entity.id;
      const part = "content";
      // this.editor.host.goTo(
      //   `elementaentity:${componentId}/${entityId}/${part}`,
      // );
    });
  }
}
