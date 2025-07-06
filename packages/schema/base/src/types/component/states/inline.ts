import { z } from "zod";
import type { BaseStateData} from "./_base.js";
import { baseStateDataSchema } from "./_base.js";

export type InlineStateData = BaseStateData<"inline"> & {
  script?: string;
};

// Schemas

export const inlineStateDataSchema = baseStateDataSchema("inline").extend({
  script: z.string().optional(),
});
