import { z } from "zod";
import type { IdentifiableData } from "../../_shared/identifiable.js";
import { identifiableDataSchema } from "../../_shared/identifiable.js";

export type BaseStateData<T extends string> = IdentifiableData & {
  type: T;
  name?: string;
};

// Schemas

export const baseStateDataSchema = (type: string) =>
  identifiableDataSchema.extend({
    type: z.literal(type),
    name: z.string().optional(),
    varName: z.string().optional(),
  });
