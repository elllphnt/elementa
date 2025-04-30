import { InstanceRenderable } from "@elllphnt/elementa-scene";
import { Observable } from "rxjs";
import { IElementHandle } from "./elements/element";
import { IEntityHandle } from "./entity";

export interface IFragmentHandle extends IEntityHandle<InstanceRenderable> {
  content$: Observable<IElementHandle[]>;
  content: IElementHandle[];
}
