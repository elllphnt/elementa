import { RouteData } from "@elllphnt/elementa-base";
import {
  attachReactiveMap,
  getOrCreateYArray,
  ReactiveList,
  ReactiveMap,
  setEnhancer,
  setModelFields,
} from "@elllphnt/elementa-utils";
import { map, Observable } from "rxjs";
import * as y from "yjs";
import { genId } from "../../_lib/id.js";
import { Component } from "../../component/component.js";
import { ModelFile } from "../../infrastructure/_.js";
import { App } from "../app.js";
import { attachRouteTreeList } from "./_list.js";

export type RouteTree = ReactiveMap<RouteData> & {
  app: App;
  id: string;
  children: ReactiveList<RouteTree>;

  path: string | undefined;
  path$: Observable<string | undefined>;

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

  mainViewComponent: ModelFile<Component> | undefined;
  mainViewComponent$: Observable<ModelFile<Component> | undefined>;

  errorViewComponent: ModelFile<Component> | undefined;
  errorViewComponent$: Observable<ModelFile<Component> | undefined>;

  pendingViewComponent: ModelFile<Component> | undefined;
  pendingViewComponent$: Observable<ModelFile<Component> | undefined>;

  notFoundViewComponent: ModelFile<Component> | undefined;
  notFoundViewComponent$: Observable<ModelFile<Component> | undefined>;
};

export function attachRouteTree(ymap: y.Map<any>, app: App): ymap is RouteTree {
  if (!attachReactiveMap<RouteData>(ymap)) {
    throw new Error("Failed to attach reactive map to ymap");
  }
  const rxMap = ymap;
  const route = rxMap as RouteTree;

  const children = getOrCreateYArray<y.Map<any>>(rxMap, "children");
  if (!attachRouteTreeList(children, app)) {
    throw new Error("Failed to attach route tree list");
  }
  route.children = children;

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
        const url = (route as any)[urlKey];
        return url ? route.app.project.absoluteFileUrl(url) : undefined;
      },
    });
    Object.defineProperty(route, `${absoluteUrlKey}$`, {
      get() {
        const url$: Observable<string | undefined> = (route as any)[
          `${urlKey}$`
        ];
        return url$.pipe(
          map((url) =>
            url ? route.app.project.absoluteFileUrl(url) : undefined
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
    Object.defineProperty(route, `${key}Component`, {
      get() {
        const url = (route as any)[urlKey];
        return url
          ? route.app.project.infrastructure.component(url)
          : undefined;
      },
    });
    Object.defineProperty(route, `${key}Component$`, {
      get() {
        const url$: Observable<string | undefined> = (route as any)[
          `${urlKey}$`
        ];
        return url$.pipe(
          map((url) =>
            url ? route.app.project.infrastructure.component(url) : undefined
          )
        );
      },
    });
  });

  setEnhancer(route, attachRouteTree);
  return true;
}

export function createRoute(app: App): RouteTree {
  const ymap = new y.Map<any>();
  if (!attachRouteTree(ymap, app)) {
    throw new Error("Failed to attach route");
  }
  return ymap;
}
