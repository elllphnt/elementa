import { Observable } from "rxjs";
import { AsyncResource, File } from "~/infrastructure/_.js";

export interface FileModelAdaptor<M> extends AsyncResource {
  readonly file: File;

  get model(): M | undefined;
  get model$(): Observable<M | undefined>;
}
