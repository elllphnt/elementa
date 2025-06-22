import nodepath from "path";
import { JsApp } from "tools/generator/js_app/js_app.js";
import { jsAppPaths } from "tools/generator/js_app/paths.js";
import { writeFile } from "tools/generator/utils/fs.js";
import { AbsolutePageRouteData } from "../_libs/route_tree.js";
import { generateComponent } from "../component/component.js";
import { toRelativeRoute } from "./_utils.js";
import { generateLazyRouteScript } from "./lazy_route_script.js";

export async function generateRoute({
  jsApp,
  rootDir,
  route,
  generatedResources,
}: {
  jsApp: JsApp;
  rootDir: string;
  route: AbsolutePageRouteData;
  generatedResources: Set<string>;
}) {
  const lazyPath = jsAppPaths.lazyRoute(route.id);
  const absoluteLazyPath = nodepath.resolve(rootDir, lazyPath);

  const componentGenerations: Promise<void>[] = [];

  if (route.mainViewFile) {
    componentGenerations.push(
      generateComponent({
        context: jsApp.context,
        absoluteUrl: route.mainViewFile.url,
        rootDir,
        generatedResources,
      })
    );
  }

  if (route.errorViewFile) {
    componentGenerations.push(
      generateComponent({
        context: jsApp.context,
        absoluteUrl: route.errorViewFile.url,
        rootDir,
        generatedResources,
      })
    );
  }

  if (route.pendingViewFile) {
    componentGenerations.push(
      generateComponent({
        context: jsApp.context,
        absoluteUrl: route.pendingViewFile.url,
        rootDir,
        generatedResources,
      })
    );
  }

  if (route.notFoundViewFile) {
    componentGenerations.push(
      generateComponent({
        context: jsApp.context,
        absoluteUrl: route.notFoundViewFile.url,
        rootDir,
        generatedResources,
      })
    );
  }

  await Promise.all(componentGenerations);

  if (componentGenerations.length) {
    await writeFile(
      absoluteLazyPath,
      generateLazyRouteScript({
        route: toRelativeRoute({
          absolutePath: absoluteLazyPath,
          rootDir,
          route,
        }),
      })
    );
  }

  jsApp.addRoute({
    id: route.id,
    path: route.absolutePath,
    type: "page",
    dynamic: !!route.loaderFile,
  });
}
