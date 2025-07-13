import type { RouteTreeData } from "@elllphnt/elementa-base";
import { toAbsoluteFileUrl } from "@elllphnt/elementa-base";
import { joinPaths } from "../../_utils/path.js";
import type { GeneratorContext } from "../../context/context.js";
import type { ElementaReferencedFileData } from "../../context/infra/infra.js";

export type AbsolutePageRouteData = {
  id: string;
  type: "page";
  parentId?: string;
  path?: string;
  absolutePath: string;
  loaderFile?: ElementaReferencedFileData;
  mainViewFile?: ElementaReferencedFileData;
  errorViewFile?: ElementaReferencedFileData;
  pendingViewFile?: ElementaReferencedFileData;
  notFoundViewFile?: ElementaReferencedFileData;
};
export type AbsoluteHandlerRouteData = {
  id: string;
  type: "handler";
  absolutePath: string;
  file: ElementaReferencedFileData;
};

export type FlattenRouteTree = {
  pages: AbsolutePageRouteData[];
  handlers: AbsoluteHandlerRouteData[];
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
  projectId,
  routeTree,
  absolutePath: parentAbsolutePath = "",
  context,
}: {
  projectId: string;
  routeTree: RouteTreeData;
  absolutePath?: string;
  context: GeneratorContext;
}): Promise<FlattenRouteTree> {
  const result = {
    pages: [] as AbsolutePageRouteData[],
    handlers: [] as AbsoluteHandlerRouteData[],
    resources: [] as string[],
  };

  const absolutePath =
    "/" + joinPaths(parentAbsolutePath, routeTree.path || "");

  if (routeTree.handler) {
    result.resources.push(routeTree.handler.__import.module);
    const absoluteUrl = toAbsoluteFileUrl({
      projectId,
      url: routeTree.handler.__import.module,
    });

    const file = await context.infra.getFile(absoluteUrl);
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

    if (routeTree.loader) {
      result.resources.push(routeTree.loader.__import.module);
      const absoluteLoaderUrl = toAbsoluteFileUrl({
        projectId,
        url: routeTree.loader.__import.module,
      });
      fileOps.push(
        context.infra.getFile(absoluteLoaderUrl).then((file) => {
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

    if (routeTree.mainView) {
      result.resources.push(routeTree.mainView.__import.module);
      const absoluteMainViewUrl = toAbsoluteFileUrl({
        projectId,
        url: routeTree.mainView.__import.module,
      });
      fileOps.push(
        context.infra.getFile(absoluteMainViewUrl).then((file) => {
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

    if (routeTree.errorView) {
      result.resources.push(routeTree.errorView.__import.module);
      const absoluteErrorViewUrl = toAbsoluteFileUrl({
        projectId,
        url: routeTree.errorView.__import.module,
      });
      fileOps.push(
        context.infra.getFile(absoluteErrorViewUrl).then((file) => {
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

    if (routeTree.pendingView) {
      result.resources.push(routeTree.pendingView.__import.module);
      const absolutePendingViewUrl = toAbsoluteFileUrl({
        projectId,
        url: routeTree.pendingView.__import.module,
      });
      fileOps.push(
        context.infra.getFile(absolutePendingViewUrl).then((file) => {
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

    if (routeTree.notFoundView) {
      result.resources.push(routeTree.notFoundView.__import.module);
      const absoluteNotFoundViewUrl = toAbsoluteFileUrl({
        projectId,
        url: routeTree.notFoundView.__import.module,
      });
      fileOps.push(
        context.infra.getFile(absoluteNotFoundViewUrl).then((file) => {
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
        projectId,
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
  }

  return result;
}

export async function flattenRouteTrees({
  projectId,
  routeTrees,
  context,
}: {
  projectId: string;
  routeTrees: RouteTreeData[];
  context: GeneratorContext;
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
        projectId,
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
  }

  result.resources = [...new Set(result.resources)];

  return result;
}
