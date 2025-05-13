import { z } from "zod";
import { ProviderData, providerDataSchema } from "../../../provider/_.js";
import { ElementData, elementDataSchema } from "../element.js";

// Types

export type ElementContainerData = {
  content?: ElementData[];
  providers?: ProviderData[];
};

// Schemas

export const elementContainerDataSchema = z.object({
  content: z.array(elementDataSchema).optional(),
  providers: z.array(providerDataSchema).optional(),
});
