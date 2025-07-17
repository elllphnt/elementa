import { z } from "zod";
import {
  importReferenceSchema,
  type ImportReference,
} from "../_primitives/_.js";
import type { IdentifiableData } from "../_shared/_.js";

// Types

export type RouteData = IdentifiableData & {
  path?: string;
  parentId?: string;
  loaderRef?: ImportReference;
  handlerRef?: ImportReference;
  mainViewRef?: ImportReference;
  errorViewRef?: ImportReference;
  pendingViewRef?: ImportReference;
  notFoundViewRef?: ImportReference;
};

export type RouteTreeData = RouteData & {
  children?: RouteTreeData[];
};

// Schemas

export const routeDataSchema = z.object({
  id: z.string(),
  path: z.string().optional(),
  parentId: z.string().optional(),
  loader: importReferenceSchema.optional(),
  handler: importReferenceSchema.optional(),
  mainView: importReferenceSchema.optional(),
  errorView: importReferenceSchema.optional(),
  pendingView: importReferenceSchema.optional(),
  notFoundView: importReferenceSchema.optional(),
});

export const routeTreeDataSchema: z.ZodType<RouteTreeData> =
  routeDataSchema.extend({
    children: z.lazy(() => z.array(routeTreeDataSchema)).optional(),
  });
