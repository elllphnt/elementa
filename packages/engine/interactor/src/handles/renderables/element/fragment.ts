import type { FragmentElementRenderable } from "@elllphnt/elementa-scene";
import type { Handle } from "~/handles/handle.js";
import type { ElementaInteractor } from "~/interactor.js";
import { BaseElementHandle } from "./_base.js";

export class FragmentElementHandle extends BaseElementHandle<FragmentElementRenderable> {
  constructor({
    renderable,
    interactor,
    parent,
  }: {
    renderable: FragmentElementRenderable;
    interactor: ElementaInteractor;
    parent: Handle | null;
  }) {
    super({ renderable, interactor, parent });
  }
}
