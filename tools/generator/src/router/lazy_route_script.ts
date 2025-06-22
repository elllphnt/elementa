import { RelativeRoute } from "./_utils.js";

export function generateLazyRouteScript({
  route,
}: {
  route: RelativeRoute;
}): string {
  const imports: string[] = [
    `import { createLazyRoute } from '@tanstack/react-router'`,
  ];
  const options: string[] = [];

  if (route.mainViewPath) {
    imports.push(`import MainView from '${route.mainViewPath}'`);
    options.push("component: MainView");
  }
  if (route.errorViewPath) {
    imports.push(`import ErrorView from '${route.errorViewPath}'`);
    options.push("errorComponent: ErrorView");
  }
  if (route.pendingViewPath) {
    imports.push(`import PendingView from '${route.pendingViewPath}'`);
    options.push("pendingComponent: PendingView");
  }
  if (route.notFoundViewPath) {
    imports.push(`import NotFoundView from '${route.notFoundViewPath}'`);
    options.push("notFoundComponent: NotFoundView");
  }

  return [
    ...imports,
    "",
    `export default createLazyRoute('${route.id}')({`,
    options.join(","),
    "})",
  ].join("\n");
}
