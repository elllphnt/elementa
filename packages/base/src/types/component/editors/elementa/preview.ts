import { z } from "zod";
import { CornerData, cornerDataSchema } from "../../../_primitives/_.js";
import {
  RenderableContentData,
  renderableContentDataSchema,
} from "./renderable_content.js";
import {
  RenderingContextData,
  renderingContextDataSchema,
} from "./rendering_context.js";

// Types

export type ElementaPreviewData = {
  renderingContext?: RenderingContextData;
  content?: RenderableContentData;
  corners?: CornerData<number>;
};

// Schemas

export const elementaPreviewDataSchema = z.object({
  context: renderingContextDataSchema.optional(),
  content: renderableContentDataSchema.optional(),
  corners: cornerDataSchema(z.number()).optional(),
});
