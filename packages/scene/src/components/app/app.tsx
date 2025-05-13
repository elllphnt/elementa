import { useObservable } from "@elllphnt/elementa-react-utils";
import { createRouter, Outlet, RouterProvider } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { JSX, memo, useMemo } from "react";
import { AppRenderable } from "../../renderables/app/app.js";

export const AppComponent = memo(function ({
  app,
}: {
  app: AppRenderable;
}): JSX.Element {
  const routeTree = useObservable(app.tsRootRoute$, app.tsRootRoute);
  const router = useMemo(() => {
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
    const router = createRouter({ routeTree, history: app.history });
    return router;
  }, [routeTree]);

  if (router) {
    return <RouterProvider router={router} />;
  } else {
    return <></>;
  }
});

export default AppComponent;
