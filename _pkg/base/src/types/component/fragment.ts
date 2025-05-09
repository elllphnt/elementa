import { DataInputData } from "../_shared/data_input.js";
import { IdentifiableData } from "../_shared/identifiable.js";
import { ElementContainerData } from "./_.js";
import { z } from "zod";
import { dataInputDataSchema } from "../_shared/data_input.js";
import { identifiableDataSchema } from "../_shared/identifiable.js";
import { elementContainerDataSchema } from "./_.js";

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
