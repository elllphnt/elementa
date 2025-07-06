import { z } from "zod";
import type { DataInputData} from "../_shared/_.js";
import { dataInputDataSchema } from "../_shared/_.js";
import type {
  IdentifiableData} from "../_shared/identifiable.js";
import {
  identifiableDataSchema,
} from "../_shared/identifiable.js";
import type { ProviderData} from "../provider/_.js";
import { providerDataSchema } from "../provider/_.js";
import type {
  ElementContainerData} from "./elements/_.js";
import {
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
