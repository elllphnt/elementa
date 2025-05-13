import { Model } from "@elllphnt/elementa-utils";
import { map, Observable } from "rxjs";

export abstract class BaseModel<D> extends Model<D> {
  get updated$(): Observable<void> {
    return this.data$.pipe(map(() => void 0));
  }
}
