import { moduleRelativePath } from "../../_utils/path.js";
import { GeneratorContext } from "../../context/context.js";
import { JsRoute } from "../../js_app/js_app.js";
import { jsAppPaths } from "../../js_app/paths.js";
import { AbsolutePageRouteData } from "../_libs/route_tree.js";
import { RelativeRoute, toRelativeRoute } from "./_utils.js";
import { generateRoute } from "./route.js";
import { generateRouteTreeScript } from "./route_tree_script.js";
import { generateRouterScript } from "./router_script.js";

export async function generateRouter({
  routes,
  generatedResources,
  context,
}: {
  routes: AbsolutePageRouteData[];
  generatedResources: Set<string>;
  context: GeneratorContext;
}) {
  const routeTreePath = jsAppPaths.routeTree;
  const routerPath = jsAppPaths.router;

  const relativeRoutes: RelativeRoute[] = [];
  const jsRoutes: JsRoute[] = [];

  for (const route of routes) {
    const jsRoute = await generateRoute({
      route,
      generatedResources,
      context,
    });
    relativeRoutes.push(
      toRelativeRoute({
        path: routeTreePath,
        route,
      })
    );
    jsRoutes.push(jsRoute);
  }

  await context.out.write(
    routeTreePath,
    generateRouteTreeScript({ routes: relativeRoutes })
  );
  await context.out.write(
    routerPath,
    generateRouterScript({
      routeTreePath: moduleRelativePath(routerPath, routeTreePath),
    })
  );

  return jsRoutes;
}
