import { Observable } from "rxjs";
import { Disposable, keyManager } from "../core/_.js";

export abstract class Model<D> extends Disposable {
  key: string;

  abstract get data(): D;
  abstract get data$(): Observable<D>;

  abstract restore(data: D): void;

  constructor({ key }: { key?: string } = {}) {
    super();
    this.key = key ?? keyManager.next("model");
  }

  clone(): this {
    throw Error("Not implemented");
  }
}

export type ModelData<M> = M extends Model<infer D> ? D : never;
