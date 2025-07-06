import { z } from "zod";
import type { CornerData} from "../../../_primitives/_.js";
import { cornerDataSchema } from "../../../_primitives/_.js";
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

export type ElementaPreviewData = {
  context?: RenderingContextData;
  content?: RenderableContentData;
  corners?: CornerData<number>;
};

// Schemas

export const elementaPreviewDataSchema = z.object({
  context: renderingContextDataSchema.optional(),
  content: renderableContentDataSchema.optional(),
  corners: cornerDataSchema(z.number()).optional(),
});
