import { z } from "zod";
import { ProviderData, providerDataSchema } from "../provider/_.js";
import { RouteTreeData, routeTreeDataSchema } from "./route.js";

// Types

export type AppData = {
  routes?: RouteTreeData[];
  providers?: ProviderData[];
  editors?: Record<string, Record<string, any>>;
};

// Schemas

export const appSchema = z.object({
  routes: z.array(routeTreeDataSchema).optional(),
  providers: z.array(providerDataSchema).optional(),
  editors: z.record(z.record(z.any())).optional(),
});
