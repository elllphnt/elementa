import {
  AppData,
  appSchema,
  elementaStandardPaths,
  PackageSheetData,
  parseFileUrl,
  RouterData,
  routerSchema,
  toAbsoluteFileUrl,
} from "@elllphnt/elementa-base";
import { parseContentWithSchema } from "../_utils/parse.js";
import { GeneratorContext } from "../context/context.js";
import { JsAppConfig } from "../js_app/js_app.js";
import { jsAppPaths } from "../js_app/paths.js";
import { flattenRouteTrees } from "./_libs/route_tree.js";
import { generateClientEntry } from "./client/client.js";
import { generateHandlers } from "./handlers/handlers.js";
import { generateRouter } from "./router/router.js";
import { generateServerEntry } from "./server/server.js";

export async function generateJsApp({
  url,
  context,
}: {
  url: string;
  context: GeneratorContext;
}): Promise<JsAppConfig> {
  context.log("debug", "Generating app...", { url });
  const { projectId, fileId } = parseFileUrl(url);
  if (!projectId) {
    throw new Error(`Expected absolute app url, found: ${url}`);
  }

  const appFileContent = await context.infra.read(url);
  const app = parseContentWithSchema(
    appFileContent.trim() || "{}",
    appSchema
  ) as AppData;
  context.log("debug", "Retrieved app data.");

  if (!app.routerUrl) {
    throw new Error(`App at ${url} does not have a routerUrl defined.`);
  }

  const routerAbsoluteUrl = toAbsoluteFileUrl({
    url: app.routerUrl,
    projectId,
  });
  const routerFile = await context.infra.read(routerAbsoluteUrl);
  const router = parseContentWithSchema(
    routerFile.trim() || "{}",
    routerSchema
  ) as RouterData;
  context.log("debug", "Retrieved app router data.");

  const { pages, handlers } = await flattenRouteTrees({
    projectId,
    routeTrees: router.routes || [],
    context,
  });
  context.log("debug", "Flattened route trees.");
  const generatedResources = new Set<string>();

  const pageJsRoutes = await generateRouter({
    routes: pages,
    generatedResources,
    context,
  });
  await generateServerEntry({ context });
  await generateClientEntry({ context });
  const handlerJsRoutes = await generateHandlers({
    routes: handlers,
    generatedResources,
    context,
  });

  // generate import map
  const importMap: Record<string, string> = {};
  const packagesFile = await context.infra.getFileAtPath(
    projectId,
    elementaStandardPaths.packages
  );
  if (packagesFile) {
    const packagesContent = await context.infra.read(packagesFile.url);
    const sheet: PackageSheetData = JSON.parse(packagesContent.trim() || "{}");
    context.log("debug", "Retrieved packages data.", { packages: sheet });
    for (const pkg of sheet.packages) {
      importMap[pkg.name] = `https://esm.sh/${pkg.name}@${pkg.version}`;
    }
  }

  const jsApp: JsAppConfig = {
    id: fileId,
    routes: [...pageJsRoutes, ...handlerJsRoutes],
    importMap,
  };
  context.out.write(jsAppPaths.config, JSON.stringify(jsApp, null, 2));
  context.log("debug", "Generated JS app config.", { jsApp });

  return jsApp;
}
