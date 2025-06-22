import nodepath from "path";
import { JsApp } from "tools/generator/js_app/js_app.js";
import { jsAppPaths } from "tools/generator/js_app/paths.js";
import { writeFile } from "tools/generator/utils/fs.js";
import { moduleRelativePath } from "tools/generator/utils/path.js";
import { AbsolutePageRouteData } from "../_libs/route_tree.js";
import { RelativeRoute, toRelativeRoute } from "./_utils.js";
import { generateRoute } from "./route.js";
import { generateRouteTreeScript } from "./route_tree_script.js";
import { generateRouterScript } from "./router_script.js";

export async function generateRouter({
  jsApp,
  routes,
  rootDir,
  generatedResources,
}: {
  jsApp: JsApp;
  routes: AbsolutePageRouteData[];
  rootDir: string;
  generatedResources: Set<string>;
}) {
  const routeTreePath = jsAppPaths.routeTree;
  const routerPath = jsAppPaths.router;

  const absoluteRouteTreePath = nodepath.join(rootDir, routeTreePath);
  const absoluteRouterPath = nodepath.join(rootDir, routerPath);

  const relativeRoutes: RelativeRoute[] = [];

  for (const route of routes) {
    await generateRoute({
      jsApp,
      rootDir,
      route,
      generatedResources,
    });
    relativeRoutes.push(
      toRelativeRoute({
        absolutePath: absoluteRouteTreePath,
        rootDir,
        route,
      })
    );
  }

  await writeFile(
    absoluteRouteTreePath,
    generateRouteTreeScript({ routes: relativeRoutes })
  );
  await writeFile(
    absoluteRouterPath,
    generateRouterScript({
      routeTreePath: moduleRelativePath(
        absoluteRouterPath,
        absoluteRouteTreePath
      ),
    })
  );
}
