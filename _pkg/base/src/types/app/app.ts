import { z } from "zod";
import { RouteTreeData, routeTreeDataSchema } from "./route.js";

// Types

export type AppVariableData = {
  varName?: string;
  name?: string;
  tsType?: string;
  scope?: "public" | "private";
  description?: string;
};

export type AppData = {
  routes?: RouteTreeData[];
  variables?: AppVariableData[];
  editors?: Record<string, Record<string, any>>;
};

// Schemas

export const appVariableSchema = z.object({
  varName: z.string().optional(),
  name: z.string().optional(),
  tsType: z.string().optional(),
  scope: z.enum(["public", "private"]).optional(),
  description: z.string().optional(),
});

export const appSchema = z.object({
  routes: z.array(routeTreeDataSchema).optional(),
  variables: z.array(appVariableSchema).optional(),
  editors: z.record(z.record(z.any())).optional(),
});
