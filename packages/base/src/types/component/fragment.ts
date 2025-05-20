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
    providers?: ProviderData[];
  };

// Schemas

export const fragmentDataSchema = identifiableDataSchema
  .merge(elementContainerDataSchema)
  .extend({});
