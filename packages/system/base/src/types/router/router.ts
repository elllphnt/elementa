import { z } from "zod";
import { RouteTreeData, routeTreeDataSchema } from "./route.js";

// Types

export type RouterData = {
  routes?: RouteTreeData[];
  editors?: Record<string, Record<string, any>>;
};

// Schemas

export const routerSchema = z.object({
  routes: z.array(routeTreeDataSchema).optional(),
  editors: z.record(z.record(z.any())).optional(),
});
