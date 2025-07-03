import { InstanceRenderable } from "@elllphnt/elementa-scene";
import { Observable } from "rxjs";
import { IElementHandle } from "./elements/element.js";
import { RenderableHandle } from "./renderable.js";

export interface IFragmentHandle extends RenderableHandle<InstanceRenderable> {
  content$: Observable<IElementHandle[]>;
  content: IElementHandle[];
}
