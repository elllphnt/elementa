import { z } from "zod";
import type { CornerData} from "../../../_primitives/_.js";
import { cornerDataSchema } from "../../../_primitives/_.js";
import type {
  IdentifiableData} from "../../../_shared/_.js";
import {
  identifiableDataSchema,
} from "../../../_shared/_.js";
import type {
  RenderableContentData} from "./renderable_content.js";
import {
  renderableContentDataSchema,
} from "./renderable_content.js";
import type {
  RenderingContextData} from "./rendering_context.js";
import {
  renderingContextDataSchema,
} from "./rendering_context.js";

// Types

export type ElementaFrameData = IdentifiableData & {
  name?: string;
  context?: RenderingContextData;
  content?: RenderableContentData;
  x?: number;
  y?: number;
  height?: number;
  width?: number;
  corners?: CornerData<number>;
};

// Schemas

export const elementaFrameDataSchema = identifiableDataSchema.merge(
  z.object({
    name: z.string().optional(),
    context: renderingContextDataSchema.optional(),
    content: renderableContentDataSchema.optional(),
    x: z.number().optional(),
    y: z.number().optional(),
    height: z.number().optional(),
    width: z.number().optional(),
    corners: cornerDataSchema(z.number()).optional(),
  })
);
