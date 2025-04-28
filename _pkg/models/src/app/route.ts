import { RouteData } from "@elllphnt/elementa-base";
import {
  attachReactiveMap,
  ReactiveMap,
  setEnhancer,
  setModelFields,
} from "@elllphnt/elementa-utils";
import { Observable } from "rxjs";
import * as y from "yjs";
import { genId } from "../_lib/id";
import { App } from "./app";

export type Route = ReactiveMap<RouteData> & {
  app: App;
  id: string;

  path: string;
  path$: Observable<string>;

  parentId: string | undefined;
  parentId$: Observable<string | undefined>;

  mainViewUrl: string | undefined;
  mainViewUrl$: Observable<string | undefined>;

  errorViewUrl: string | undefined;
  errorViewUrl$: Observable<string | undefined>;

  pendingViewUrl: string | undefined;
  pendingViewUrl$: Observable<string | undefined>;

  notFoundViewUrl: string | undefined;
  notFoundViewUrl$: Observable<string | undefined>;

  loaderUrl: string | undefined;
  loaderUrl$: Observable<string | undefined>;

  handlerUrl: string | undefined;
  handlerUrl$: Observable<string | undefined>;
};

export function attachRoute(ymap: y.Map<any>, app: App): Route {
  const rxMap = attachReactiveMap<RouteData>(ymap);
  const route = rxMap as Route;

  // initialization
  route.app = app;
  if (!rxMap.doc) {
    rxMap.set("id", genId());
  }
  Object.defineProperty(route, "id", {
    get() {
      return rxMap.get("id");
    },
  });

  setModelFields(route, [
    "path",
    "parentId",
    "mainViewUrl",
    "errorViewUrl",
    "pendingViewUrl",
    "notFoundViewUrl",
    "loaderUrl",
    "handlerUrl",
  ] as const);

  setEnhancer(route, attachRoute);
  return route;
}

export function createRoute(app: App): Route {
  const ymap = new y.Map<any>();
  return attachRoute(ymap, app);
}
