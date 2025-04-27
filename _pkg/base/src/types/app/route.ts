export type RouteData = {
  id: string;
  path?: string;
  parentId?: string;
  loaderUrl?: string;
  handlerUrl?: string;
  mainViewUrl?: string;
  errorViewUrl?: string;
  pendingViewUrl?: string;
  notFoundViewUrl?: string;
};
