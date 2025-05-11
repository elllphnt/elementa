import { RouteData } from "@elllphnt/elementa-base";
import {
  assert,
  attachEnhancedReactiveList,
  attachReactiveMap,
  getOrCreateYArray,
  setEnhancer,
  setObjectGetter,
  setObjectProperty,
  setReactiveMapGetters,
  setReactiveMapSetters,
} from "@elllphnt/elementa-utils";
import { map } from "rxjs";
import * as y from "yjs";
import { genId } from "../../../_lib/id.js";
import { App, RouteTree } from "../../_interfaces/_.js";

export function attachRouteTree(
  route: y.Map<any>,
  app: App
): route is y.Map<any> & RouteTree {
  assert(attachReactiveMap<RouteData>(route));

  if (!route.doc) {
    route.set("id", genId());
  }

  assert(setObjectGetter(route, "id", () => route.get("id") as string));
  assert(setObjectProperty(route, "app", app));

  const childrenList = getOrCreateYArray<y.Map<any>>(route, "children");
  assert(
    attachEnhancedReactiveList<RouteTree>(
      childrenList,
      attachRouteTree,
      (route) => attachRouteTree(route, app)
    )
  );

  assert(setObjectProperty(route, "children$", childrenList.items$));
  assert(setObjectGetter(route, "children", () => childrenList.items));

  assert(
    setReactiveMapGetters(route, [
      "path",
      "parentId",
      "mainViewUrl",
      "errorViewUrl",
      "pendingViewUrl",
      "notFoundViewUrl",
      "loaderUrl",
      "handlerUrl",
    ])
  );
  assert(
    setReactiveMapSetters(route, [
      ["setPath", "path"],
      ["setParentId", "parentId"],
      ["setMainViewUrl", "mainViewUrl"],
      ["setErrorViewUrl", "errorViewUrl"],
      ["setPendingViewUrl", "pendingViewUrl"],
      ["setNotFoundViewUrl", "notFoundViewUrl"],
      ["setLoaderUrl", "loaderUrl"],
      ["setHandlerUrl", "handlerUrl"],
    ] as const)
  );

  assert(
    setObjectProperty(
      route,
      "mainViewComponent$",
      route.mainViewUrl$.pipe(
        map((url) => {
          if (url) {
            return app.project.infrastructure.component(url);
          } else {
            return undefined;
          }
        })
      )
    )
  );
  assert(
    setObjectGetter(route, "mainViewComponent", () => {
      const absoluteUrl = route.mainViewUrl
        ? app.project.absoluteFileUrl(route.mainViewUrl)
        : undefined;
      if (absoluteUrl) {
        return app.project.infrastructure.component(absoluteUrl);
      } else {
        return undefined;
      }
    })
  );

  assert(
    setObjectProperty(
      route,
      "errorViewComponent$",
      route.errorViewUrl$.pipe(
        map((url) => {
          if (url) {
            return app.project.infrastructure.component(url);
          } else {
            return undefined;
          }
        })
      )
    )
  );
  assert(
    setObjectGetter(route, "errorViewComponent", () => {
      const absoluteUrl = route.errorViewUrl
        ? app.project.absoluteFileUrl(route.errorViewUrl)
        : undefined;
      if (absoluteUrl) {
        return app.project.infrastructure.component(absoluteUrl);
      } else {
        return undefined;
      }
    })
  );

  assert(
    setObjectProperty(
      route,
      "pendingViewComponent$",
      route.pendingViewUrl$.pipe(
        map((url) => {
          if (url) {
            return app.project.infrastructure.component(url);
          } else {
            return undefined;
          }
        })
      )
    )
  );
  assert(
    setObjectGetter(route, "pendingViewComponent", () => {
      const absoluteUrl = route.pendingViewUrl
        ? app.project.absoluteFileUrl(route.pendingViewUrl)
        : undefined;
      if (absoluteUrl) {
        return app.project.infrastructure.component(absoluteUrl);
      } else {
        return undefined;
      }
    })
  );

  assert(
    setObjectProperty(
      route,
      "notFoundViewComponent$",
      route.notFoundViewUrl$.pipe(
        map((url) => {
          if (url) {
            return app.project.infrastructure.component(url);
          } else {
            return undefined;
          }
        })
      )
    )
  );
  assert(
    setObjectGetter(route, "notFoundViewComponent", () => {
      const absoluteUrl = route.notFoundViewUrl
        ? app.project.absoluteFileUrl(route.notFoundViewUrl)
        : undefined;
      if (absoluteUrl) {
        return app.project.infrastructure.component(absoluteUrl);
      } else {
        return undefined;
      }
    })
  );

  // Setup cleanup
  const disposeBase = route.dispose || (() => {});
  route.dispose = () => {
    childrenList.dispose?.();
    disposeBase();
  };

  return setEnhancer<RouteTree>(route, attachRouteTree);
}
