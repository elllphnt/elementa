import { z } from "zod";
import { CornerData, cornerDataSchema } from "../../../_primitives/_.js";
import {
  RenderingContextData,
  renderingContextDataSchema,
} from "../elementa/rendering_context.js";

// Types

export type ElementaViewerComponentStateData = RenderingContextData & {
  corners?: CornerData<number>;
};

// Schemas

export const elementaViewerComponentStateDataSchema =
  renderingContextDataSchema.extend({
    corners: cornerDataSchema(z.number()).optional(),
  });
