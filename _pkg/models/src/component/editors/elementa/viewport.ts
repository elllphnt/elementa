import { OverflowValue, ViewportData } from "@elllphnt/elementa-base";
import {
  attachReactiveMap,
  Extendable,
  ReactiveMap,
  setEnhancer,
  setModelFields,
} from "@elllphnt/elementa-utils";
import { Observable } from "rxjs";
import * as y from "yjs";

export type Viewport = ReactiveMap<ViewportData> & {
  height: number;
  height$: Observable<number>;

  width: number;
  width$: Observable<number>;

  overflow: OverflowValue;
  overflow$: Observable<OverflowValue>;
};

export function attachViewport(ymap: y.Map<any>): Viewport {
  const viewport = attachReactiveMap<ViewportData>(
    ymap as y.Map<any>
  ) as Viewport;

  setModelFields(viewport, ["height", "width", "overflow"]);

  setEnhancer(viewport, attachViewport);
  return viewport as Viewport;
}

export function createViewport(): Viewport {
  const ymap = new y.Map<any>();
  return attachViewport(ymap);
}
