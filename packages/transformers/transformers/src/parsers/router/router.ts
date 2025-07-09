import {
  genId,
  type RouterData,
  type RouteTreeData,
} from "@elllphnt/elementa-base";
import { createRefMarkup } from "@elllphnt/elementa-transformer-primitives";

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
    data.loaderUrl = createRefMarkup(route.loader);
  }
  if (route.handler) {
    data.handlerUrl = createRefMarkup(route.handler);
  }
  if (route.component) {
    data.mainViewUrl = createRefMarkup(route.component);
  }
  if (route.errorComponent) {
    data.errorViewUrl = createRefMarkup(route.errorComponent);
  }
  if (route.pendingComponent) {
    data.pendingViewUrl = createRefMarkup(route.pendingComponent);
  }
  if (route.notFoundComponent) {
    data.notFoundViewUrl = createRefMarkup(route.notFoundComponent);
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
