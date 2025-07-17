import { parseFileUrl } from "@elllphnt/elementa-base";

export const jsAppPaths = {
  config: "app.json",
  serverEntry: "server/index.tsx",
  clientEntry: "client/index.tsx",
  routeTree: "router/route_tree.tsx",
  router: "router/router.tsx",
  lazyRoute: (routeId: string) => `router/routes/${routeId}/lazy.tsx`,
  handler: (routeId: string) => `handlers/${routeId}/index.tsx`,
  resource: (absoluteUrl: string) => {
    const { projectId, fileId } = parseFileUrl(absoluteUrl);
    return `resources/${projectId}/${fileId}.tsx`;
  },
  style: (absoluteUrl: string) => {
    const { projectId, fileId } = parseFileUrl(absoluteUrl);
    return `styles/${projectId}/${fileId}.css`;
  },
};
