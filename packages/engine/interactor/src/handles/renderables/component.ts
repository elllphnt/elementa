import type { ComponentRenderable } from "@elllphnt/elementa-scene";
import type { ElementaInteractor } from "~/interactor.js";
import type { Handle } from "../handle.js";
import { RenderableHandle } from "./renderable.js";

export class ComponentHandle extends RenderableHandle<ComponentRenderable> {
  constructor({
    interactor,
    renderable,
    parent,
  }: {
    interactor: ElementaInteractor;
    renderable: ComponentRenderable;
    parent: Handle | null;
  }) {
    super({
      id: [parent?.id, renderable.instance.model.url].filter(Boolean).join("."),
      renderable,
      interactor,
      parent,
    });
  }

  delete(): void {
    throw new Error("Method not implemented.");
  }
}
