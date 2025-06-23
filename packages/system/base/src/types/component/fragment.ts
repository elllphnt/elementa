import { z } from "zod";
import { DataInputData, dataInputDataSchema } from "../_shared/_.js";
import {
  IdentifiableData,
  identifiableDataSchema,
} from "../_shared/identifiable.js";
import { ProviderData, providerDataSchema } from "../provider/_.js";
import {
  ElementContainerData,
  elementContainerDataSchema,
} from "./elements/_.js";

export type FragmentData = IdentifiableData &
  ElementContainerData & {
    name?: string;
    varName?: string;
    providers?: ProviderData[];
    params?: DataInputData[];
  };

// Schemas

export const fragmentDataSchema = identifiableDataSchema
  .merge(elementContainerDataSchema)
  .extend({
    name: z.string().optional(),
    varName: z.string().optional(),
    providers: z.array(providerDataSchema).optional(),
    params: z.array(dataInputDataSchema).optional(),
  });
