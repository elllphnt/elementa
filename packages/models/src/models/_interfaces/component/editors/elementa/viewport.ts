import { OverflowValue } from "@elllphnt/elementa-base";
import { Observable } from "rxjs";

export interface Viewport {
  height: number;
  height$: Observable<number>;

  width: number;
  width$: Observable<number>;

  overflow: OverflowValue;
  overflow$: Observable<OverflowValue>;
}
