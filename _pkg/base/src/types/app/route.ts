import { z } from "zod";

// Types

export type RouteData = {
  id: string;
  path?: string;
  parentId?: string;
  loaderUrl?: string;
  handlerUrl?: string;
  mainViewUrl?: string;
  errorViewUrl?: string;
  pendingViewUrl?: string;
  notFoundViewUrl?: string;
};

export type RouteTreeData = RouteData & {
  children?: RouteTreeData[];
};

// Schemas

export const routeDataSchema = z.object({
  id: z.string(),
  path: z.string().optional(),
  parentId: z.string().optional(),
  loaderUrl: z.string().optional(),
  handlerUrl: z.string().optional(),
  mainViewUrl: z.string().optional(),
  errorViewUrl: z.string().optional(),
  pendingViewUrl: z.string().optional(),
  notFoundViewUrl: z.string().optional(),
});

export const routeTreeDataSchema: z.ZodType<RouteTreeData> =
  routeDataSchema.extend({
    children: z.lazy(() => z.array(routeTreeDataSchema)).optional(),
  });
