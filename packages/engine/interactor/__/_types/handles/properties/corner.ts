import { CornerName } from "@elllphnt/elementa-base";
import { Observable } from "rxjs";
import { Handle } from "../handle.js";

export interface ICornerHandle extends Handle {
  corner<C extends CornerName>(name: C): number | undefined;
  corner$<C extends CornerName>(name: C): Observable<number | undefined>;

  setCorner(name: CornerName, value: number | undefined): void;
}
