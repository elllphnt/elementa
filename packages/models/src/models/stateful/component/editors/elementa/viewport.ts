import { OverflowValue, ViewportData } from "@elllphnt/elementa-base";
import {
  assert,
  attachReactiveMap,
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

export function attachViewport(ymap: y.Map<any>): ymap is Viewport {
  assert(attachReactiveMap<ViewportData>(ymap as y.Map<any>));
  const viewport = ymap as Viewport;

  setModelFields(viewport, ["height", "width", "overflow"]);

  setEnhancer(viewport, attachViewport);
  return true;
}

export function createViewport(): Viewport {
  const ymap = new y.Map<any>();
  assert(attachViewport(ymap));
  return ymap;
}
