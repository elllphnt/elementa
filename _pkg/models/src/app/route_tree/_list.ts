import {
  createEnhancedReactiveList,
  ReactiveList,
  setEnhancer,
} from "@elllphnt/elementa-utils";
import * as y from "yjs";
import { App } from "../app.js";
import { attachRouteTree, RouteTree } from "./route_tree.js";

export type RouteTreeList = ReactiveList<RouteTree> & {};

export function attachRouteTreeList(
  yarray: y.Array<y.Map<any>>,
  app: App
): yarray is RouteTreeList {
  const rxList = createEnhancedReactiveList(
    yarray as y.Array<y.Map<any>>,
    attachRouteTree,
    (ymap) => attachRouteTree(ymap, app)
  );
  const list = rxList as RouteTreeList;

  setEnhancer(list, attachRouteTreeList);
  return true;
}

export function createRouteTreeList(app: App): RouteTreeList {
  const yarray = new y.Array<y.Map<any>>();
  if (!attachRouteTreeList(yarray, app)) {
    throw new Error("Failed to attach route tree list");
  }

  return yarray;
}
