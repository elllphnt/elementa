import { CornerName } from "@elllphnt/elll-element";
import { Observable } from "rxjs";
import { IHandle } from "../handle";

export interface ICornerHandle extends IHandle {
  corner<C extends CornerName>(name: C): number | undefined;
  corner$<C extends CornerName>(name: C): Observable<number | undefined>;

  setCorner(name: CornerName, value: number | undefined): void;
}
