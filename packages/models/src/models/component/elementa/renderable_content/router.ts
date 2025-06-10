import { Observable } from "rxjs";
import { FileModelAdaptor } from "~/project/_.js";
import { BaseRenderableContent } from "./_base.js";

export interface RouterRenderableContent
  extends BaseRenderableContent<"router"> {
  routerUrl: string | undefined;
  routerUrl$: Observable<string | undefined>;

  router: FileModelAdaptor<"router"> | undefined;
  router$: Observable<FileModelAdaptor<"router"> | undefined>;
}
