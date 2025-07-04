import type { MediaElementRenderable } from "@elllphnt/elementa-scene";
import type { Handle } from "~/_types/_";
import type { IFragmentHandle } from "~/_types/handles/renderable/fragment";
import { ElementHandle } from "./element.js";

export class MediaElementHandle<
  R extends MediaElementRenderable = MediaElementRenderable
> extends ElementHandle<R> {
  constructor({
    renderable,
    fragment,
    parent,
  }: {
    renderable: R;
    fragment: IFragmentHandle;
    parent: Handle | null;
  }) {
    super({ renderable, fragment, parent });
  }
}
