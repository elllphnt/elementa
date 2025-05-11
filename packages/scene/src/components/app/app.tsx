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
  return <RouterProvider router={router} />;
});

export default AppComponent;
