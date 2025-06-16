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

export const baseStateDataSchema = (type: string) =>
  identifiableDataSchema.extend({
    type: z.literal(type),
    name: z.string().optional(),
    varName: z.string().optional(),
  });
