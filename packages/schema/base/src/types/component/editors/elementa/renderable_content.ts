import { z } from "zod";
import {
  importedValueSchema,
  type ImportedValue,
} from "../../../_primitives/_.js";
import type { SlotFillData } from "../../elements/_.js";

export type BaseRenderableContentData<T extends string> = {
  type: T;
};

export type FragmentRenderableContentData =
  BaseRenderableContentData<"fragment"> & {
    fragmentId?: string;
    params?: Record<string, any>;
  };
export type ComponentRenderableContentData =
  BaseRenderableContentData<"component"> & {
    component?: ImportedValue;
    props?: Record<string, any>;
    fills?: Record<string, SlotFillData>;
  };
export type RouterRenderableContentData =
  BaseRenderableContentData<"router"> & {
    router?: ImportedValue;
    variables?: Record<string, any>;
  };

export type RenderableContentData =
  | ComponentRenderableContentData
  | FragmentRenderableContentData
  | RouterRenderableContentData;

// Schemas
export const baseRenderableContentDataSchema = z.object({});

export const fragmentRenderableContentDataSchema =
  baseRenderableContentDataSchema.extend({
    type: z.literal("fragment"),
    fragmentId: z.string().optional(),
    params: z.record(z.any()).optional(),
  });
export const componentRenderableContentDataSchema =
  baseRenderableContentDataSchema.extend({
    type: z.literal("component"),
    component: importedValueSchema.optional(),
    props: z.record(z.any()).optional(),
  });
export const routerRenderableContentDataSchema =
  baseRenderableContentDataSchema.extend({
    type: z.literal("router"),
    router: importedValueSchema.optional(),
    variables: z.record(z.any()).optional(),
  });

export const renderableContentDataSchema = z.discriminatedUnion("type", [
  componentRenderableContentDataSchema,
  fragmentRenderableContentDataSchema,
  routerRenderableContentDataSchema,
]);
