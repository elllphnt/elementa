import { Renderable } from "@elllphnt/elementa-scene";
import { Handle } from "../handle.js";

export interface RenderableHandle<R extends Renderable = Renderable>
  extends Handle {
  readonly renderable: R;
}
