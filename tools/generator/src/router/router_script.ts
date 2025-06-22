export function generateRouterScript({
  routeTreePath,
}: {
  routeTreePath: string;
}): string {
  return [
    `import routeTree from '${routeTreePath}'`,
    `import { createRouter as createTanstackRouter } from '@tanstack/react-router'`,
    ``,
    `export function createRouter() {`,
    `  const router = createTanstackRouter({ routeTree })`,
    `  return router`,
    `}`,
    `export default createRouter;`,
  ].join("\n");
}
