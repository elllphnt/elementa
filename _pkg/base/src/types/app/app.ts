import { z } from "zod";
import { routeTreeDataSchema } from "./route";

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
  editors?: Record<string, Record<string, unknown>>;
};

// Schemas

export const appVariableDataSchema = z.object({
  varName: z.string().optional(),
  name: z.string().optional(),
  tsType: z.string().optional(),
  scope: z.enum(["public", "private"]).optional(),
  description: z.string().optional(),
});

export const appDataSchema = z.object({
  routes: z.array(routeTreeDataSchema).optional(),
  variables: z.array(appVariableDataSchema).optional(),
  editors: z.record(z.record(z.unknown())).optional(),
});
