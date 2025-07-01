import { logger } from "@elllphnt/elementa-kernel";
import { useObservable } from "@elllphnt/elementa-react-utils";
import { createRouter, Outlet, RouterProvider } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { JSX, memo, useMemo } from "react";
import { RouterRenderable } from "../../renderables/router/router.js";

export const RouterComponent = memo(function ({
  router,
}: {
  router: RouterRenderable;
}): JSX.Element {
  logger.debug("Rendering RouterComponent", { router });

  const routeTree = useObservable(router.tsRootRoute$, router.tsRootRoute);
  logger.debug("RouterComponent routeTree resolved", { routeTree });

  const tsRouter = useMemo(() => {
    if (!routeTree) {
      logger.debug("RouterComponent: No route tree available");
      return undefined;
    }

    logger.debug("RouterComponent: Creating TanStack router", { routeTree });
    routeTree.update({
      component: () => (
        <>
          <Outlet />
          <TanStackRouterDevtools />
        </>
      ),
    });
    const tsRouter = createRouter({ routeTree, history: router.history });
    logger.debug("RouterComponent: TanStack router created", { tsRouter });
    return tsRouter;
  }, [routeTree]);

  if (tsRouter) {
    logger.debug("RouterComponent: Rendering with router", { tsRouter });
    return <RouterProvider router={tsRouter} />;
  } else {
    logger.debug("RouterComponent: No router available, rendering empty");
    return <></>;
  }
});

export default RouterComponent;
