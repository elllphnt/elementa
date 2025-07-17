import { type RouterData, type RouteTreeData } from "@elllphnt/elementa-base";
import type { ReactRouteData, ReactRouterData } from "~/types/router.js";

export function compileRoute(route: RouteTreeData): ReactRouteData {
  const data: ReactRouteData = {};

  if (route.path) {
    data.path = route.path;
  }
  if (route.loaderRef) {
    data.loader = route.loaderRef.__import.module;
  }
  if (route.handlerRef) {
    data.handler = route.handlerRef.__import.module;
  }
  if (route.mainViewRef) {
    data.component = route.mainViewRef.__import.module;
  }
  if (route.errorViewRef) {
    data.errorComponent = route.errorViewRef.__import.module;
  }
  if (route.pendingViewRef) {
    data.pendingComponent = route.pendingViewRef.__import.module;
  }
  if (route.notFoundViewRef) {
    data.notFoundComponent = route.notFoundViewRef.__import.module;
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
