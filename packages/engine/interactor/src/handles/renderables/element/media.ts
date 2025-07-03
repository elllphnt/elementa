import type { MediaElementRenderable } from "@elllphnt/elementa-scene";
import type { Handle } from "~/handles/handle.js";
import type { ElementaInteractor } from "~/interactor.js";
import { BaseElementHandle } from "./_base.js";

export class MediaElementHandle<
  R extends MediaElementRenderable = MediaElementRenderable
> extends BaseElementHandle<R> {
  constructor({
    renderable,
    interactor,
    parent,
  }: {
    renderable: R;
    interactor: ElementaInteractor;
    parent: Handle | null;
  }) {
    super({ renderable, interactor, parent });
  }
}
