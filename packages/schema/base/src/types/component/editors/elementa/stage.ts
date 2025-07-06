import { z } from "zod";
import type { ElementaFrameData} from "./frame.js";
import { elementaFrameDataSchema } from "./frame.js";

// Types

export type ElementaStageData = {
  frames?: ElementaFrameData[];
};

// Schemas

export const elementaStageDataSchema = z.object({
  frames: z.array(elementaFrameDataSchema).optional(),
});
