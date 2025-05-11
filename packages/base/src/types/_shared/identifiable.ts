import { z } from "zod";

// Types

export type IdentifiableData = {
  id: string;
};

// Schemas

export const identifiableDataSchema = z.object({
  id: z.string(),
});
