import nodepath from "path";
import { jsAppPaths } from "tools/generator/js_app/paths.js";
import { moduleRelativePath } from "tools/generator/utils/path.js";
import { AbsolutePageRouteData } from "../_libs/route_tree.js";

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
  absolutePath,
  rootDir,
  route,
}: {
  absolutePath: string;
  rootDir: string;
  route: AbsolutePageRouteData;
}): RelativeRoute {
  const relative: RelativeRoute = {
    id: route.id,
    path: route.absolutePath,
    parentId: route.parentId,
    lazyPath: moduleRelativePath(
      absolutePath,
      nodepath.resolve(rootDir, jsAppPaths.lazyRoute(route.id))
    ),
  };

  const resourceRelativeUrl = (absoluteUrl: string) => {
    const resourcePath = jsAppPaths.resource(absoluteUrl);
    const resourceAbsolutePath = nodepath.resolve(rootDir, resourcePath);
    return moduleRelativePath(absolutePath, resourceAbsolutePath);
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

  return relative;
}
