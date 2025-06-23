import { GeneratorContext } from "../../context/context.js";
import { JsRoute } from "../../js_app/js_app.js";
import { jsAppPaths } from "../../js_app/paths.js";
import { AbsoluteHandlerRouteData } from "../_libs/route_tree.js";
import { generateHandlerScript } from "./handler_script.js";

export async function generateHandler({
  route,
  context,
}: {
  route: AbsoluteHandlerRouteData;
  context: GeneratorContext;
}): Promise<JsRoute> {
  const handlerPath = jsAppPaths.handler(route.id);

  await context.out.write(
    handlerPath,
    generateHandlerScript({
      handlerUrl: route.file.url,
    })
  );

  return {
    id: route.id,
    path: route.absolutePath,
    type: "handler",
    functionId: route.id,
  };
}

export async function generateHandlers({
  routes,
  generatedResources,
  context,
}: {
  routes: AbsoluteHandlerRouteData[];
  generatedResources: Set<string>;
  context: GeneratorContext;
}) {
  const jsRoutes: JsRoute[] = [];

  for (const route of routes) {
    if (generatedResources.has(route.file.url)) {
      continue; // Skip if already generated
    }

    const jsRoute = await generateHandler({
      route,
      context,
    });
    jsRoutes.push(jsRoute);
    generatedResources.add(route.file.url);
  }

  return jsRoutes;
}
