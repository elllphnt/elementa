import { z } from "zod";
import {
  IdentifiableData,
  identifiableDataSchema,
} from "../../_shared/identifiable.js";

export type BaseStateData<T extends string> = IdentifiableData & {
  type: T;
  name?: string;
  varName?: string;
};

// Schemas

export const baseStateDataSchema = identifiableDataSchema.extend({
  type: z.string(),
  name: z.string().optional(),
  varName: z.string().optional(),
});
