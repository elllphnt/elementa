import type { InstanceRenderable } from "@elllphnt/elementa-scene";
import type { Observable } from "rxjs";
import type { IElementHandle } from "./elements/element.js";
import type { RenderableHandle } from "./renderable.js";

export interface IFragmentHandle extends RenderableHandle<InstanceRenderable> {
  content$: Observable<IElementHandle[]>;
  content: IElementHandle[];
}
