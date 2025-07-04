import type { FunctionRouteHandler } from "./function.js";
import type { PageRouteHandler } from "./page.js";

export type RouteHandler = PageRouteHandler | FunctionRouteHandler;
