import { InstanceRenderable } from "@repo/elementa-renderer";
import { Observable } from "rxjs";
import { IElementHandle } from "./elements/element";
import { IPageElementHandle } from "./elements/page";
import { IEntityHandle } from "./entity";

export interface IFragmentHandle extends IEntityHandle<InstanceRenderable> {
  content$: Observable<IElementHandle[]>;
  content: IElementHandle[];
  page: IPageElementHandle | undefined;
  page$: Observable<IPageElementHandle | undefined>;
}
