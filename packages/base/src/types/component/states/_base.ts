import { IdentifiableData } from "../../_shared/identifiable.js";
import { z } from "zod";
import { identifiableDataSchema } from "../../_shared/identifiable.js";

export type BaseStateData = IdentifiableData & {
  type: string;
  name?: string;
  varName?: string;
};

// Schemas

export const baseStateDataSchema = identifiableDataSchema.extend({
  type: z.string(),
  name: z.string().optional(),
  varName: z.string().optional(),
});
