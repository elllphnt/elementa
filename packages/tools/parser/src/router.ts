import type { RouterData, RouteTreeData } from "@elllphnt/elementa-base";
import { genId } from "./parsers/_.js";
import { createReferenceString } from "./references.js";

export type ReactRouteData = {
  path?: string;
  loader?: string;
  handler?: string;
  component?: string;
  errorComponent?: string;
  pendingComponent?: string;
  notFoundComponent?: string;
  children?: ReactRouteData[];
};
export type ReactRouterData = {
  routes?: ReactRouteData[];
};

export function transformRoute(route: ReactRouteData): RouteTreeData {
  const data: RouteTreeData = {
    id: genId(),
  };

  if (route.path) {
    data.path = route.path;
  }
  if (route.loader) {
    data.loaderUrl = createReferenceString(route.loader);
  }
  if (route.handler) {
    data.handlerUrl = createReferenceString(route.handler);
  }
  if (route.component) {
    data.mainViewUrl = createReferenceString(route.component);
  }
  if (route.errorComponent) {
    data.errorViewUrl = createReferenceString(route.errorComponent);
  }
  if (route.pendingComponent) {
    data.pendingViewUrl = createReferenceString(route.pendingComponent);
  }
  if (route.notFoundComponent) {
    data.notFoundViewUrl = createReferenceString(route.notFoundComponent);
  }
  if (route.children && route.children.length > 0) {
    data.children = route.children.map(transformRoute);
  }

  return data;
}

export function transformRouter(router: ReactRouterData): RouterData {
  const data: RouterData = {};

  if (router.routes && router.routes.length > 0) {
    data.routes = router.routes.map(transformRoute);
  }

  return data;
}
