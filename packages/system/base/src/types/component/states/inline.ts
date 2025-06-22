import { z } from "zod";
import { BaseStateData, baseStateDataSchema } from "./_base.js";

export type InlineStateData = BaseStateData<"inline"> & {
  script?: string;
};

// Schemas

export const inlineStateDataSchema = baseStateDataSchema("inline").extend({
  script: z.string().optional(),
});
