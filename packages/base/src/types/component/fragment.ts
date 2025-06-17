import { DataInputData } from "../_shared/_.js";
import {
  IdentifiableData,
  identifiableDataSchema,
} from "../_shared/identifiable.js";
import { ProviderData } from "../provider/_.js";
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
  .extend({});
