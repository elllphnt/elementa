import { z } from "zod";
import { DataInputData, dataInputDataSchema } from "../_shared/data_input.js";
import {
  IdentifiableData,
  identifiableDataSchema,
} from "../_shared/identifiable.js";
import {
  ElementContainerData,
  elementContainerDataSchema,
} from "./elements/_.js";

export type FragmentData = IdentifiableData &
  ElementContainerData & {
    params?: DataInputData[];
  };

// Schemas

export const fragmentDataSchema = identifiableDataSchema
  .merge(elementContainerDataSchema)
  .extend({
    params: z.array(dataInputDataSchema).optional(),
  });
