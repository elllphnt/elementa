import { VectorElementRenderable } from "@elllphnt/elementa-scene";
import { IHandle } from "~/src/_types/_";
import { IFragmentHandle } from "~/src/_types/handles/entity/fragment";
import { ElementHandle } from "./element";

export class VectorElementHandle extends ElementHandle<VectorElementRenderable> {
  constructor({
    renderable,
    fragment,
    parent,
  }: {
    renderable: VectorElementRenderable;
    fragment: IFragmentHandle;
    parent: IHandle | null;
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
