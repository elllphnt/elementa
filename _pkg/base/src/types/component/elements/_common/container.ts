import { z } from "zod";
import { ProviderData, providerDataSchema } from "../../provider/_";
import { ElementData } from "../element";
import { elementRepeatDataSchema } from "./repeatable";

// Types

export type ElementContainerData = {
  content?: ElementData[];
  providers?: ProviderData[];
};

// Schemas

export const elementContainerDataSchema = z.object({
  content: z.array(elementRepeatDataSchema).optional(),
  providers: z.array(providerDataSchema).optional(),
});
