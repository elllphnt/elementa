import { Model } from "@elllphnt/elementa-utils";
import { map, Observable } from "rxjs";

export abstract class StatefulModel<D> extends Model<D> {
  get updated$(): Observable<void> {
    return this.data$.pipe(map(() => void 0));
  }

  clone(): this {
    throw Error("Not implemented");
  }
}
