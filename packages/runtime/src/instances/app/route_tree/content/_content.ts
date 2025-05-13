import { FunctionRouteHandler } from "./function.js";
import { PageRouteHandler } from "./page.js";

export type RouteHandler = PageRouteHandler | FunctionRouteHandler;
