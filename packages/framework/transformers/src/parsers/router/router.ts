import {
  genId,
  type RouterData,
  type RouteTreeData,
} from "@elllphnt/elementa-base";
import type { ReactRouteData, ReactRouterData } from "~/types/router.js";

export function transformRoute(route: ReactRouteData): RouteTreeData {
  const data: RouteTreeData = {
    id: genId(),
  };

  if (route.path) {
    data.path = route.path;
  }
  if (route.loader) {
    data.loaderRef = route.loader
      ? {
          __import: {
            module: route.loader,
          },
        }
      : undefined;
  }
  if (route.handler) {
    data.handlerRef = route.handler
      ? {
          __import: {
            module: route.handler,
          },
        }
      : undefined;
  }
  if (route.component) {
    data.mainViewRef = route.component
      ? {
          __import: {
            module: route.component,
          },
        }
      : undefined;
  }
  if (route.errorComponent) {
    data.errorViewRef = route.errorComponent
      ? {
          __import: {
            module: route.errorComponent,
          },
        }
      : undefined;
  }
  if (route.pendingComponent) {
    data.pendingViewRef = route.pendingComponent
      ? {
          __import: {
            module: route.pendingComponent,
          },
        }
      : undefined;
  }
  if (route.notFoundComponent) {
    data.notFoundViewRef = route.notFoundComponent
      ? {
          __import: {
            module: route.notFoundComponent,
          },
        }
      : undefined;
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
