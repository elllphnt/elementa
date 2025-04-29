import { RouteData } from "@elllphnt/elementa-base";
import {
  attachReactiveMap,
  ReactiveMap,
  setEnhancer,
  setModelFields,
} from "@elllphnt/elementa-utils";
import { map, Observable } from "rxjs";
import * as y from "yjs";
import { genId } from "../_lib/id";
import { Component } from "../component/component";
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

  absoluteMainViewUrl: string | undefined;
  absoluteMainViewUrl$: Observable<string | undefined>;

  absoluteErrorViewUrl: string | undefined;
  absoluteErrorViewUrl$: Observable<string | undefined>;

  absolutePendingViewUrl: string | undefined;
  absolutePendingViewUrl$: Observable<string | undefined>;

  absoluteNotFoundViewUrl: string | undefined;
  absoluteNotFoundViewUrl$: Observable<string | undefined>;

  absoluteLoaderUrl: string | undefined;
  absoluteLoaderUrl$: Observable<string | undefined>;

  absoluteHandlerUrl: string | undefined;
  absoluteHandlerUrl$: Observable<string | undefined>;

  mainViewComponent: Component | undefined;
  mainViewComponent$: Observable<Component | undefined>;

  errorViewComponent: Component | undefined;
  errorViewComponent$: Observable<Component | undefined>;

  pendingViewComponent: Component | undefined;
  pendingViewComponent$: Observable<Component | undefined>;

  notFoundViewComponent: Component | undefined;
  notFoundViewComponent$: Observable<Component | undefined>;
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
  ]);

  [
    ["mainViewUrl", "absoluteMainViewUrl"],
    ["errorViewUrl", "absoluteErrorViewUrl"],
    ["pendingViewUrl", "absolutePendingViewUrl"],
    ["notFoundViewUrl", "absoluteNotFoundViewUrl"],
    ["loaderUrl", "absoluteLoaderUrl"],
    ["handlerUrl", "absoluteHandlerUrl"],
  ].forEach(([urlKey, absoluteUrlKey]) => {
    Object.defineProperty(route, absoluteUrlKey, {
      get() {
        const url = route[urlKey];
        return url
          ? route.app.project.infrastructure.fileSystem.getAbsoluteFileUrl(
              route.app.url,
              url
            )
          : undefined;
      },
    });
    Object.defineProperty(route, `${absoluteUrlKey}$`, {
      get() {
        const url$: Observable<string | undefined> = route[`${urlKey}$`];
        return url$.pipe(
          map((url) =>
            url
              ? route.app.project.infrastructure.fileSystem.getAbsoluteFileUrl(
                  route.app.url,
                  url
                )
              : undefined
          )
        );
      },
    });
  });

  [
    ["absoluteMainViewUrl", "mainView"],
    ["absoluteErrorViewUrl", "errorView"],
    ["absolutePendingViewUrl", "pendingView"],
    ["absoluteNotFoundViewUrl", "notFoundView"],
  ].forEach(([urlKey, key]) => {
    Object.defineProperty(route, key, {
      get() {
        const url = route[urlKey];
        return url
          ? route.app.project.componentManager.component(url)
          : undefined;
      },
    });
    Object.defineProperty(route, `${key}$`, {
      get() {
        const url$: Observable<string | undefined> = route[`${urlKey}$`];
        return url$.pipe(
          map((url) =>
            url ? route.app.project.componentManager.component(url) : undefined
          )
        );
      },
    });
  });

  setEnhancer(route, attachRoute);
  return route;
}

export function createRoute(app: App): Route {
  const ymap = new y.Map<any>();
  return attachRoute(ymap, app);
}
