import { OverflowValue } from "@elllphnt/elementa-base";
import { Observable } from "rxjs";

export interface Viewport {
  height: number | undefined;
  height$: Observable<number | undefined>;

  width: number | undefined;
  width$: Observable<number | undefined>;

  overflow: OverflowValue | undefined;
  overflow$: Observable<OverflowValue | undefined>;
}
