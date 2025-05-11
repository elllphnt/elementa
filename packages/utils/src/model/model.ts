import { Observable } from "rxjs";
import { Disposable } from "../core/_.js";

export abstract class Model<D> extends Disposable {
  abstract get data(): D;
  abstract get data$(): Observable<D>;

  abstract restore(data: D): void;
}

export type ModelData<M> = M extends Model<infer D> ? D : never;
