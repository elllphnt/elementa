import { z } from "zod";
import { CornerData, cornerDataSchema } from "../../../_primitives/_.js";
import {
  RenderableContentData,
  renderableContentDataSchema,
} from "../elementa/renderable_content.js";
import {
  RenderingContextData,
  renderingContextDataSchema,
} from "../elementa/rendering_context.js";

// Types

export type ElementaViewerComponentStateData = {
  renderingContext?: RenderingContextData;
  content?: RenderableContentData;
  corners?: CornerData<number>;
};

// Schemas

export const elementaViewerComponentStateDataSchema = z.object({
  context: renderingContextDataSchema.optional(),
  content: renderableContentDataSchema.optional(),
  corners: cornerDataSchema(z.number()).optional(),
});
