import { z } from "zod";
import {
  type IdentifiableData,
  identifiableDataSchema,
} from "../../_shared/identifiable.js";
import {
  AccessibleData,
  accessibleDataSchema,
  ConditionalData,
  conditionalDataSchema,
  InteractiveData,
  interactiveDataSchema,
  LinkableData,
  linkableDataSchema,
  RepeatableData,
  repeatableDataSchema,
  StylableData,
  stylableDataSchema,
} from "./_common/_.js";

// Types

export type BaseElementData<T extends string> = IdentifiableData &
  StylableData &
  RepeatableData &
  ConditionalData &
  InteractiveData &
  LinkableData &
  AccessibleData & {
    type: T;
    name?: string;
    tag?: string;
  };

// Schemas

export const baseElementDataSchema = identifiableDataSchema
  .merge(stylableDataSchema)
  .merge(repeatableDataSchema)
  .merge(conditionalDataSchema)
  .merge(interactiveDataSchema)
  .merge(linkableDataSchema)
  .merge(accessibleDataSchema)
  .extend({
    type: z.string(),
    name: z.string().optional(),
    tag: z.string().optional(),
  });
