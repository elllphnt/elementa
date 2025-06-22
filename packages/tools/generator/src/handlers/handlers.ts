import nodepath from "path";
import { JsApp } from "tools/generator/js_app/js_app.js";
import { jsAppPaths } from "tools/generator/js_app/paths.js";
import { writeFile } from "tools/generator/utils/fs.js";
import { AbsoluteHandlerRouteData } from "../_libs/route_tree.js";
import { generateHandlerScript } from "./handler_script.js";

export async function generateHandler({
  jsApp,
  rootDir,
  route,
}: {
  jsApp: JsApp;
  rootDir: string;
  route: AbsoluteHandlerRouteData;
  generatedResources: Set<string>;
}) {
  const handlerPath = jsAppPaths.handler(route.id);
  const absoluteHandlerPath = nodepath.join(rootDir, handlerPath);

  await writeFile(
    absoluteHandlerPath,
    generateHandlerScript({
      handlerUrl: route.file.url,
    })
  );

  jsApp.addRoute({
    id: route.id,
    path: route.absolutePath,
    type: "handler",
    functionId: route.id,
  });
}

export async function generateHandlers({
  jsApp,
  rootDir,
  routes,
  generatedResources,
}: {
  jsApp: JsApp;
  rootDir: string;
  routes: AbsoluteHandlerRouteData[];
  generatedResources: Set<string>;
}) {
  for (const route of routes) {
    await generateHandler({
      jsApp,
      rootDir,
      route,
      generatedResources,
    });
  }
}
