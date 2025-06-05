import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
} from "@tanstack/react-router";
import { StandardizeView } from "./standardize.js";
import { Transformer } from "./transformer.js";

// Root route
const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

// Home route - the current transformer and preview
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Transformer,
});

// Standardization route
const stdRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/std",
  component: StandardizeView,
});

// Create and export the router
const routeTree = rootRoute.addChildren([indexRoute, stdRoute]);
export const router = createRouter({ routeTree });

// Type declarations for router
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
