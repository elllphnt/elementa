import { MediaElementRenderable } from "@repo/elementa-renderer";
import { IHandle } from "~/src/_types/_";
import { IFragmentHandle } from "~/src/_types/handles/entity/fragment";
import { ElementHandle } from "./element";

export class MediaElementHandle<
  R extends MediaElementRenderable = MediaElementRenderable,
> extends ElementHandle<R> {
  constructor({
    renderable,
    fragment,
    parent,
  }: {
    renderable: R;
    fragment: IFragmentHandle;
    parent: IHandle | null;
  }) {
    super({ renderable, fragment, parent });
  }
}
