import { parseFileUrl } from "@elllphnt/elementa-base";

export const jsAppPaths = {
  config: "app.json",
  serverEntry: "server.js",
  clientEntry: "client.js",
  routeTree: "router/route_tree.js",
  router: "router/router.js",
  lazyRoute: (routeId: string) => `router/routes/${routeId}/lazy.js`,
  handler: (routeId: string) => `handlers/${routeId}/index.js`,
  resource: (absoluteUrl: string) => {
    const { projectId, fileId } = parseFileUrl(absoluteUrl);
    return `resources/${projectId}/${fileId}.js`;
  },
};
