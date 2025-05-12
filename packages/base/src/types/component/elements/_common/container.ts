import { z } from "zod";
import { ProviderData, providerDataSchema } from "../../../provider/_.js";
import { ElementData } from "../element.js";
import { elementRepeatDataSchema } from "./repeatable.js";

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
