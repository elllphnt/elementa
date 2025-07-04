import type { Model } from "@elllphnt/elementa-kernel";
import type { Observable } from "rxjs";
import { AsyncResource } from "~/project/resource.js";

export abstract class ModelAdaptor<M extends Model> extends AsyncResource {
  abstract get model(): M | undefined;
  abstract get model$(): Observable<M | undefined>;
}
