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
  const routeTree = useObservable(router.tsRootRoute$, router.tsRootRoute);
  const tsRouter = useMemo(() => {
    if (!routeTree) {
      return undefined;
    }
    routeTree.update({
      component: () => (
        <>
          <Outlet />
          <TanStackRouterDevtools />
        </>
      ),
    });
    const tsRouter = createRouter({ routeTree, history: router.history });
    return tsRouter;
  }, [routeTree]);

  if (tsRouter) {
    return <RouterProvider router={tsRouter} />;
  } else {
    return <></>;
  }
});

export default RouterComponent;
