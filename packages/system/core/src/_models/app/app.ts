import { Observable } from "rxjs";
import { File, FileModelAdaptor } from "~/project/_.js";

export interface App {
  file: File;

  routerUrl: string | undefined;
  routerUrl$: Observable<string | undefined>;

  router: FileModelAdaptor<"router"> | undefined;
  router$: Observable<FileModelAdaptor<"router"> | undefined>;

  setRouterUrl(url: string | undefined): void;
}
