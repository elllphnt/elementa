import { PageElementRenderable } from "@repo/elementa-renderer";
import { Observable } from "rxjs";
import { IElementHandle } from "./element";

export interface IPageElementHandle
  extends IElementHandle<PageElementRenderable> {
  content: IElementHandle[];
  content$: Observable<IElementHandle[]>;
}
