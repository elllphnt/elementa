import { type RouterData, type RouteTreeData } from "@elllphnt/elementa-base";
import type { ReactRouteData, ReactRouterData } from "~/types/router.js";

export function compileRoute(route: RouteTreeData): ReactRouteData {
  const data: ReactRouteData = {};

  if (route.path) {
    data.path = route.path;
  }
  if (route.loader) {
    data.loader = route.loader.__import.module;
  }
  if (route.handler) {
    data.handler = route.handler.__import.module;
  }
  if (route.mainView) {
    data.component = route.mainView.__import.module;
  }
  if (route.errorView) {
    data.errorComponent = route.errorView.__import.module;
  }
  if (route.pendingView) {
    data.pendingComponent = route.pendingView.__import.module;
  }
  if (route.notFoundView) {
    data.notFoundComponent = route.notFoundView.__import.module;
  }
  if (route.children && route.children.length > 0) {
    data.children = route.children.map(compileRoute);
  }

  return data;
}

export function compileRouter(router: RouterData): ReactRouterData {
  const data: ReactRouterData = {};

  if (router.routes && router.routes.length > 0) {
    data.routes = router.routes.map(compileRoute);
  }

  return data;
}
