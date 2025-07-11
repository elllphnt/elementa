import { type RouterData, type RouteTreeData } from "@elllphnt/elementa-base";
import { parseRefMarkup } from "@elllphnt/elementa-transformer-primitives";

// Helper function to extract the first reference from ref markup
function extractRefMarkup(markup: string): string {
  const refs = parseRefMarkup(markup);
  return refs[0] || markup; // Return the first reference or the original string if no refs found
}

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

export function compileRoute(route: RouteTreeData): ReactRouteData {
  const data: ReactRouteData = {};

  if (route.path) {
    data.path = route.path;
  }
  if (route.loaderUrl) {
    data.loader = extractRefMarkup(route.loaderUrl);
  }
  if (route.handlerUrl) {
    data.handler = extractRefMarkup(route.handlerUrl);
  }
  if (route.mainViewUrl) {
    data.component = extractRefMarkup(route.mainViewUrl);
  }
  if (route.errorViewUrl) {
    data.errorComponent = extractRefMarkup(route.errorViewUrl);
  }
  if (route.pendingViewUrl) {
    data.pendingComponent = extractRefMarkup(route.pendingViewUrl);
  }
  if (route.notFoundViewUrl) {
    data.notFoundComponent = extractRefMarkup(route.notFoundViewUrl);
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
