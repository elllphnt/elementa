import { z } from "zod";
import { ElementaFrameData, elementaFrameDataSchema } from "./frame.js";

// Types

export type ElementaStageData = {
  frames: ElementaFrameData[];
};

// Schemas

export const elementaStageDataSchema = z.object({
  frames: z.array(elementaFrameDataSchema),
});
