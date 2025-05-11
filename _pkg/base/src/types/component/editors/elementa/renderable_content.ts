import { z } from "zod";
import { SlotFillData } from "../../elements/_.js";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type BaseRenderableContentData = {};

export type ComponentRenderableContentData = BaseRenderableContentData & {
  type: "component";
  componentUrl?: string;
  props?: Record<string, any>;
  fills?: Record<string, SlotFillData>;
};

export type FragmentRenderableContentData = BaseRenderableContentData & {
  type: "fragment";
  fragmentId?: string;
  params?: Record<string, any>;
};

export type AppRenderableContentData = BaseRenderableContentData & {
  type: "app";
  appUrl?: string;
  variables?: Record<string, any>;
};

export type RenderableContentData =
  | ComponentRenderableContentData
  | FragmentRenderableContentData
  | AppRenderableContentData;

// Schemas
export const baseRenderableContentDataSchema = z.object({});

export const componentRenderableContentDataSchema =
  baseRenderableContentDataSchema.extend({
    type: z.literal("component"),
    componentUrl: z.string().optional(),
    props: z.record(z.any()).optional(),
  });

export const fragmentRenderableContentDataSchema =
  baseRenderableContentDataSchema.extend({
    type: z.literal("fragment"),
    fragmentId: z.string().optional(),
    params: z.record(z.any()).optional(),
  });

export const appRenderableContentDataSchema =
  baseRenderableContentDataSchema.extend({
    type: z.literal("app"),
    appUrl: z.string().optional(),
    variables: z.record(z.any()).optional(),
  });

export const renderableContentDataSchema = z.discriminatedUnion("type", [
  componentRenderableContentDataSchema,
  fragmentRenderableContentDataSchema,
  appRenderableContentDataSchema,
]);
