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
