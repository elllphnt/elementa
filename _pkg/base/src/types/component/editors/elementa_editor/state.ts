import { z } from "zod";
import { ElementaFrameData, elementaFrameDataSchema } from "./frame.js";

// Types

export type ElementaEditorComponentStateData = {
  frames: ElementaFrameData[];
};

// Schemas

export const elementaEditorComponentStateDataSchema = z.object({
  frames: z.array(elementaFrameDataSchema),
});
