import { RenderableContentRenderable } from "@elllphnt/elementa-scene";
import { Handle } from "~/_types/_";
import { ElementaInteractor } from "~/_types/interactor";
import { RenderableHandle } from "./renderable.js";

export class RenderableContentHandle extends RenderableHandle<RenderableContentRenderable> {
  constructor({
    interactor,
    renderable,
    parent,
  }: {
    interactor: ElementaInteractor;
    renderable: RenderableContentRenderable;
    parent: Handle | null;
  }) {
    super({
      id: "renderable.instance.model",
      renderable,
      interactor,
      type: "content",
      parent,
    });
  }

  delete(): void {
    throw new Error("Method not implemented.");
  }
}
