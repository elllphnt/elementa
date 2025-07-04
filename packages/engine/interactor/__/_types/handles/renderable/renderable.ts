import type { Renderable } from "@elllphnt/elementa-scene";
import type { Handle } from "../handle.js";

export interface RenderableHandle<R extends Renderable = Renderable>
  extends Handle {
  readonly renderable: R;
}
