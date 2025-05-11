import { z } from "zod";
import { CornerData, cornerDataSchema } from "../../../_primitives/_.js";
import {
  IdentifiableData,
  identifiableDataSchema,
} from "../../../_shared/_.js";
import {
  RenderableContentData,
  renderableContentDataSchema,
} from "./renderable_content.js";
import {
  RenderingContextData,
  renderingContextDataSchema,
} from "./rendering_context.js";

// Types

export type ElementaFrameData = IdentifiableData & {
  name?: string;
  renderingContext?: RenderingContextData;
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
