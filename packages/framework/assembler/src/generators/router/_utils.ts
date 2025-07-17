import { moduleRelativePath } from "../../_utils/path.js";
import { jsAppPaths } from "../../js_app/paths.js";
import type { AbsolutePageRouteData } from "../_libs/route_tree.js";

export type RelativeRoute = {
  id: string;
  parentId?: string;
  path?: string;
  lazyPath: string;
  loaderPath?: string;
  mainViewPath?: string;
  errorViewPath?: string;
  pendingViewPath?: string;
  notFoundViewPath?: string;
};

export function toRelativeRoute({
  path,
  route,
}: {
  path: string;
  route: AbsolutePageRouteData;
}): RelativeRoute {
  const relative: RelativeRoute = {
    id: route.id,
    path: route.absolutePath,
    parentId: route.parentId,
    lazyPath: moduleRelativePath(path, jsAppPaths.lazyRoute(route.id)),
  };

  const resourceRelativeUrl = (absoluteUrl: string) => {
    const resourcePath = jsAppPaths.resource(absoluteUrl);
    return moduleRelativePath(path, resourcePath);
  };

  if (route.loaderFile) {
    relative.loaderPath = route.loaderFile.url;
  }
  if (route.mainViewFile) {
    relative.mainViewPath = resourceRelativeUrl(route.mainViewFile.url);
  }
  if (route.errorViewFile) {
    relative.errorViewPath = resourceRelativeUrl(route.errorViewFile.url);
  }
  if (route.pendingViewFile) {
    relative.pendingViewPath = resourceRelativeUrl(route.pendingViewFile.url);
  }
  if (route.notFoundViewFile) {
    relative.notFoundViewPath = resourceRelativeUrl(route.notFoundViewFile.url);
  }
  if (route.loaderFile) {
    relative.loaderPath = resourceRelativeUrl(route.loaderFile.url);
  }

  return relative;
}
