import { z } from "zod";
import { importedValueSchema, type ImportedValue } from "../_primitives/_.js";
import type { IdentifiableData } from "../_shared/_.js";

// Types

export type RouteData = IdentifiableData & {
  path?: string;
  parentId?: string;
  loader?: ImportedValue;
  handler?: ImportedValue;
  mainView?: ImportedValue;
  errorView?: ImportedValue;
  pendingView?: ImportedValue;
  notFoundView?: ImportedValue;
};

export type RouteTreeData = RouteData & {
  children?: RouteTreeData[];
};

// Schemas

export const routeDataSchema = z.object({
  id: z.string(),
  path: z.string().optional(),
  parentId: z.string().optional(),
  loader: importedValueSchema.optional(),
  handler: importedValueSchema.optional(),
  mainView: importedValueSchema.optional(),
  errorView: importedValueSchema.optional(),
  pendingView: importedValueSchema.optional(),
  notFoundView: importedValueSchema.optional(),
});

export const routeTreeDataSchema: z.ZodType<RouteTreeData> =
  routeDataSchema.extend({
    children: z.lazy(() => z.array(routeTreeDataSchema)).optional(),
  });
