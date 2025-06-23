import { GeneratorContext } from "../../context/context.js";
import { JsRoute } from "../../js_app/js_app.js";
import { jsAppPaths } from "../../js_app/paths.js";
import { AbsolutePageRouteData } from "../_libs/route_tree.js";
import { generateComponent } from "../component/component.js";
import { generateModule } from "../module/module.js";
import { toRelativeRoute } from "./_utils.js";
import { generateLazyRouteScript } from "./lazy_route_script.js";

export async function generateRoute({
  route,
  generatedResources,
  context,
}: {
  route: AbsolutePageRouteData;
  generatedResources: Set<string>;
  context: GeneratorContext;
}): Promise<JsRoute> {
  const lazyPath = jsAppPaths.lazyRoute(route.id);

  const componentGenerations: Promise<void>[] = [];
  const moduleGenerations: Promise<void>[] = [];

  if (route.mainViewFile) {
    componentGenerations.push(
      generateComponent({
        context,
        url: route.mainViewFile.url,
        generatedResources,
      })
    );
  }

  if (route.errorViewFile) {
    componentGenerations.push(
      generateComponent({
        context,
        url: route.errorViewFile.url,
        generatedResources,
      })
    );
  }

  if (route.pendingViewFile) {
    componentGenerations.push(
      generateComponent({
        context,
        url: route.pendingViewFile.url,
        generatedResources,
      })
    );
  }

  if (route.notFoundViewFile) {
    componentGenerations.push(
      generateComponent({
        context,
        url: route.notFoundViewFile.url,
        generatedResources,
      })
    );
  }

  if (route.loaderFile) {
    moduleGenerations.push(
      generateModule({
        context,
        url: route.loaderFile.url,
        generatedResources,
      })
    );
  }

  await Promise.all([...componentGenerations, ...moduleGenerations]);

  if (componentGenerations.length) {
    await context.out.write(
      lazyPath,
      generateLazyRouteScript({
        route: toRelativeRoute({
          path: lazyPath,
          route,
        }),
      })
    );
  }

  return {
    id: route.id,
    path: route.absolutePath,
    type: "page",
    dynamic: !!route.loaderFile,
  };
}
