import type { FragmentRenderable } from "@elllphnt/elementa-scene";
import type { ElementaInteractor } from "~/interactor.js";
import type { Handle } from "../handle.js";
import { RenderableHandle } from "./renderable.js";

export class FragmentHandle extends RenderableHandle<FragmentRenderable> {
  constructor({
    interactor,
    renderable,
    parent,
  }: {
    interactor: ElementaInteractor;
    renderable: FragmentRenderable;
    parent: Handle | null;
  }) {
    super({
      id: [parent?.id, renderable.instance.model.id].filter(Boolean).join("."),
      renderable,
      interactor,
      parent,
    });
  }

  delete(): void {
    throw new Error("Method not implemented.");
  }
}
