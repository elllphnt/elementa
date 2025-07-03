import type { CornerName } from "@elllphnt/elementa-base";
import type { Observable } from "rxjs";
import type { Handle } from "../handle.js";

export interface CornerHandle extends Handle {
  corner<C extends CornerName>(name: C): number | undefined;
  corner$<C extends CornerName>(name: C): Observable<number | undefined>;

  setCorner(name: CornerName, value: number | undefined): void;
}
