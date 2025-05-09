import { z } from "zod";
import { CornerData, cornerDataSchema } from "../../../_primitives/_.js";
import {
  RenderingContextData,
  renderingContextDataSchema,
} from "../elementa/rendering_context.js";
import {
  IdentifiableData,
  identifiableDataSchema,
} from "../../../_shared/_.js";

// Types

export type ElementaFrameData = IdentifiableData &
  RenderingContextData & {
    name?: string;
    fragmentId?: string;
    x?: number;
    y?: number;
    height?: number;
    width?: number;
    corners?: CornerData<number>;
  };

// Schemas

export const elementaFrameDataSchema = identifiableDataSchema
  .merge(renderingContextDataSchema)
  .extend({
    name: z.string().optional(),
    fragmentId: z.string().optional(),
    x: z.number().optional(),
    y: z.number().optional(),
    height: z.number().optional(),
    width: z.number().optional(),
    corners: cornerDataSchema(z.number()).optional(),
  });
