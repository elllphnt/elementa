import type { RouterRenderable } from "@elllphnt/elementa-scene";
import type { ElementaInteractor } from "~/interactor.js";
import type { Handle } from "../handle.js";
import { RenderableHandle } from "./renderable.js";

export class RouterHandle extends RenderableHandle<RouterRenderable> {
  constructor({
    interactor,
    renderable,
    parent,
  }: {
    interactor: ElementaInteractor;
    renderable: RouterRenderable;
    parent: Handle | null;
  }) {
    super({
      id: [parent?.id, "router"].filter(Boolean).join("."),
      renderable,
      interactor,
      parent,
    });
  }

  delete(): void {
    throw new Error("Method not implemented.");
  }
}
