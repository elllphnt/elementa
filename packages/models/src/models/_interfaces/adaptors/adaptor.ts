import { Observable } from "rxjs";
import { AsyncResource } from "~/infrastructure/_.js";

export interface ModelAdaptor<M> extends AsyncResource {
  get model(): M | undefined;
  get model$(): Observable<M | undefined>;
}
