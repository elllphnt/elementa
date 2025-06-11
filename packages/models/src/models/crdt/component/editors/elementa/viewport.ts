import { ViewportData } from "@elllphnt/elementa-base";
import {
  assert,
  attachReactiveMap,
  setEnhancer,
  setReactiveMapGetters,
} from "@elllphnt/elementa-utils";
import * as y from "yjs";
import { Viewport } from "../../../../../_.js";

export function attachViewport(
  viewport: y.Map<any>
): viewport is y.Map<any> & Viewport {
  assert(attachReactiveMap<ViewportData>(viewport));
  assert(setReactiveMapGetters(viewport, ["height", "width", "overflow"]));

  return setEnhancer<Viewport>(viewport, attachViewport);
}
