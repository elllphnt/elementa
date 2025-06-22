import { RouteTreeData } from "@elllphnt/elementa-base";
import { BuildContext } from "tools/generator/context/context.js";
import { BuildFile } from "tools/generator/context/fs.js";
import { joinPaths } from "tools/generator/utils/path.js";

export type AbsolutePageRouteData = {
  id: string;
  type: "page";
  parentId?: string;
  path?: string;
  absolutePath: string;
  loaderFile?: BuildFile;
  mainViewFile?: BuildFile;
  errorViewFile?: BuildFile;
  pendingViewFile?: BuildFile;
  notFoundViewFile?: BuildFile;
};
export type AbsoluteHandlerRouteData = {
  id: string;
  type: "handler";
  absolutePath: string;
  file: BuildFile;
};

export type FlattenRouteTree = {
  pages: AbsolutePageRouteData[];
  handlers: AbsoluteHandlerRouteData[];
  resources: string[];
};

export function missingRouteFileError({
  absoluteUrl,
  routeId,
  routePath,
  field,
}: {
  absoluteUrl: string;
  routeId: string;
  routePath: string;
  field: string;
}): Error {
  return new Error(
    `Missing route file for field "${field}" on route "${routePath}" (id: ${routeId}):\n→ ${absoluteUrl}`
  );
}

export async function flattenRouteTree({
  routeTree,
  absolutePath: parentAbsolutePath = "",
  context,
}: {
  routeTree: RouteTreeData;
  absolutePath?: string;
  context: BuildContext;
}): Promise<FlattenRouteTree> {
  const result = {
    pages: [] as AbsolutePageRouteData[],
    handlers: [] as AbsoluteHandlerRouteData[],
    resources: [] as string[],
  };

  const absolutePath =
    "/" + joinPaths(parentAbsolutePath, routeTree.path || "");

  if (routeTree.handlerUrl) {
    result.resources.push(routeTree.handlerUrl);
    const absoluteUrl = context.fs.absoluteUrl(routeTree.handlerUrl);

    const file = await context.fs.getFile(absoluteUrl);
    if (!file) {
      throw missingRouteFileError({
        routeId: routeTree.id,
        routePath: absolutePath,
        absoluteUrl,
        field: "handler",
      });
    }

    result.handlers.push({
      id: routeTree.id,
      type: "handler",
      absolutePath,
      file,
    });
  } else {
    const pageRoute: AbsolutePageRouteData = {
      id: routeTree.id,
      type: "page",
      parentId: routeTree.parentId,
      path: routeTree.path,
      absolutePath: "/" + joinPaths(parentAbsolutePath, routeTree.path || ""),
    };

    // Prepare file fetching operations
    const fileOps: Array<Promise<void>> = [];

    if (routeTree.loaderUrl) {
      result.resources.push(routeTree.loaderUrl);
      const absoluteLoaderUrl = context.fs.absoluteUrl(routeTree.loaderUrl);
      fileOps.push(
        context.fs.getFile(absoluteLoaderUrl).then((file) => {
          if (!file) {
            throw missingRouteFileError({
              routeId: routeTree.id,
              routePath: absolutePath,
              absoluteUrl: absoluteLoaderUrl!,
              field: "loader",
            });
          }
          pageRoute.loaderFile = file;
        })
      );
    }

    if (routeTree.mainViewUrl) {
      result.resources.push(routeTree.mainViewUrl);
      const absoluteMainViewUrl = context.fs.absoluteUrl(routeTree.mainViewUrl);
      fileOps.push(
        context.fs.getFile(absoluteMainViewUrl).then((file) => {
          if (!file) {
            throw missingRouteFileError({
              routeId: routeTree.id,
              routePath: absolutePath,
              absoluteUrl: absoluteMainViewUrl!,
              field: "mainView",
            });
          }
          pageRoute.mainViewFile = file;
        })
      );
    }

    if (routeTree.errorViewUrl) {
      result.resources.push(routeTree.errorViewUrl);
      const absoluteErrorViewUrl = context.fs.absoluteUrl(
        routeTree.errorViewUrl
      );
      fileOps.push(
        context.fs.getFile(absoluteErrorViewUrl).then((file) => {
          if (!file) {
            throw missingRouteFileError({
              routeId: routeTree.id,
              routePath: absolutePath,
              absoluteUrl: absoluteErrorViewUrl!,
              field: "errorView",
            });
          }
          pageRoute.errorViewFile = file;
        })
      );
    }

    if (routeTree.pendingViewUrl) {
      result.resources.push(routeTree.pendingViewUrl);
      const absolutePendingViewUrl = context.fs.absoluteUrl(
        routeTree.pendingViewUrl
      );
      fileOps.push(
        context.fs.getFile(absolutePendingViewUrl).then((file) => {
          if (!file) {
            throw missingRouteFileError({
              routeId: routeTree.id,
              routePath: absolutePath,
              absoluteUrl: absolutePendingViewUrl!,
              field: "pendingView",
            });
          }
          pageRoute.pendingViewFile = file;
        })
      );
    }

    if (routeTree.notFoundViewUrl) {
      result.resources.push(routeTree.notFoundViewUrl);
      const absoluteNotFoundViewUrl = context.fs.absoluteUrl(
        routeTree.notFoundViewUrl
      );
      fileOps.push(
        context.fs.getFile(absoluteNotFoundViewUrl).then((file) => {
          if (!file) {
            throw missingRouteFileError({
              routeId: routeTree.id,
              routePath: absolutePath,
              absoluteUrl: absoluteNotFoundViewUrl!,
              field: "notFoundView",
            });
          }
          pageRoute.notFoundViewFile = file;
        })
      );
    }

    // Await all file fetching operations in parallel
    await Promise.all(fileOps);

    result.pages.push(pageRoute);
  }

  // Process children in parallel
  const childResults = await Promise.all(
    (routeTree.children || []).map((child) =>
      flattenRouteTree({
        routeTree: child,
        absolutePath: "/" + joinPaths(parentAbsolutePath, routeTree.path || ""),
        context,
      })
    )
  );

  // Merge all child results
  for (const childResult of childResults) {
    result.pages.push(...childResult.pages);
    result.handlers.push(...childResult.handlers);
    result.resources.push(...childResult.resources);
  }

  result.resources = [...new Set(result.resources)];

  return result;
}

export async function flattenRouteTrees({
  routeTrees,
  context,
}: {
  routeTrees: RouteTreeData[];
  context: BuildContext;
}): Promise<FlattenRouteTree> {
  const result = {
    pages: [] as AbsolutePageRouteData[],
    handlers: [] as AbsoluteHandlerRouteData[],
    resources: [] as string[],
  };

  // Process all route trees in parallel
  const treeResults = await Promise.all(
    routeTrees.map((routeTree) =>
      flattenRouteTree({
        routeTree,
        absolutePath: "",
        context,
      })
    )
  );

  // Merge all results
  for (const treeResult of treeResults) {
    result.pages.push(...treeResult.pages);
    result.handlers.push(...treeResult.handlers);
    result.resources.push(...treeResult.resources);
  }

  result.resources = [...new Set(result.resources)];

  return result;
}
