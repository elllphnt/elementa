import {
  AppData,
  appSchema,
  RouterData,
  routerSchema,
} from "@elllphnt/elementa-base";
import { parseFileUrl } from "@elllphnt/elll-primitives";
import { packages } from "@elllphnt/elll-runtime";
import { BuildContext } from "tools/generator/context/context.js";
import { JsApp } from "tools/generator/js_app/js_app.js";
import { parseContentWithSchema } from "tools/generator/utils/parse.js";
import { flattenRouteTrees } from "./_libs/route_tree.js";
import { generateClientEntry } from "./client/client.js";
import { generateHandlers } from "./handlers/handlers.js";
import { generateRouter } from "./router/router.js";
import { generateServerEntry } from "./server/server.js";

export async function generateJsApp({
  url,
  outDir,
  context,
}: {
  url: string;
  outDir: string;
  context: BuildContext;
}): Promise<JsApp> {
  // read the app file
  const absoluteAppUrl = context.fs.absoluteUrl(url);
  const appFile = await context.fs.read(absoluteAppUrl);
  const app = parseContentWithSchema(
    appFile.trim() || "{}",
    appSchema
  ) as AppData;
  const { bareFileId } = parseFileUrl(url);

  if (!app.routerUrl) {
    context.logger.error(
      `App file at ${url} does not have a routerUrl defined.`
    );
    throw new Error(`App file at ${url} does not have a routerUrl defined.`);
  }

  const routerAbsoluteUrl = context.fs.absoluteUrl(app.routerUrl);
  const routerFile = await context.fs.read(routerAbsoluteUrl);
  const router = parseContentWithSchema(
    routerFile.trim() || "{}",
    routerSchema
  ) as RouterData;

  // flatten routes
  const { pages, handlers } = await flattenRouteTrees({
    routeTrees: router.routes || [],
    context,
  });

  // generate jsapp
  const jsApp = new JsApp({
    id: bareFileId,
    rootDir: outDir,
    context,
  });
  const generatedResources = new Set<string>();

  await generateRouter({
    jsApp,
    rootDir: outDir,
    routes: pages,
    generatedResources,
  });
  await generateServerEntry({ rootDir: outDir });
  await generateClientEntry({ rootDir: outDir });
  await generateHandlers({
    jsApp,
    rootDir: outDir,
    routes: handlers,
    generatedResources,
  });

  jsApp.setImportMap(
    Object.fromEntries(Object.keys(packages).map((p) => [p, "vendor"]))
  );
  context.logger.debug(`Import Map: ${JSON.stringify(jsApp.importMap)}`);

  return jsApp;
}
