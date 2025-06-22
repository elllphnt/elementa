import { RelativeRoute } from "./_utils.js";

export function generateRouteTreeScript({
  routes,
}: {
  routes: Array<RelativeRoute>;
}): string {
  const routeNames = Object.fromEntries(
    routes.map((route, index) => [route.id, `route_${index}`])
  );
  const routeName = (id: string) => routeNames[id];

  const lines = [
    `import { createRootRoute, createRoute, lazyRouteComponent } from '@tanstack/react-router'`,
    ``,
    `const rootRoute = createRootRoute();`,
  ];

  const parentChildren: Record<string, string[]> = {};

  // create routes

  for (const route of routes) {
    const field: string[] = [];

    if (route.path) {
      field.push(`path: '${route.path}'`);
    } else {
      field.push(`id: '${route.id}'`);
    }

    if (route.parentId) {
      field.push(`getParentRoute: () => ${routeName(route.parentId)}`);
      let children = parentChildren[route.parentId];
      if (!children) {
        children = [];
        parentChildren[route.parentId] = children;
      }
      children.push(route.id);
    } else {
      field.push(`getParentRoute: () => rootRoute`);
      let children = parentChildren[""];
      if (!children) {
        children = [];
        parentChildren[""] = children;
      }
      children.push(route.id);
    }

    // loader

    if (route.loaderPath) {
      field.push(
        `loader: (...args) => import('${route.loaderPath}').then((m) => m.default(...args))`
      );
    }

    lines.push(
      `const ${routeName(route.id)} = createRoute({ ${field.join(", ")} });`
    );

    // lazy
    if (
      route.errorViewPath ||
      route.mainViewPath ||
      route.notFoundViewPath ||
      route.pendingViewPath
    ) {
      lines.push(
        `${routeName(route.id)}.lazy(()=>import('${
          route.lazyPath
        }').then((d) => d.default))`
      );
    }
  }

  // build tree

  for (const [parentId, children] of Object.entries(parentChildren)) {
    const parentName = parentId ? routeName(parentId) : "rootRoute";
    const childNames = children.map((id) => routeName(id));
    lines.push(`${parentName}.addChildren([${childNames.join(", ")}]);`);
  }

  // export

  lines.push(`export default rootRoute;`);

  return lines.join("\n");
}
