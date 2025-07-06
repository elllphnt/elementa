import { z } from "zod";
import {
  type IdentifiableData,
  identifiableDataSchema,
} from "../../_shared/identifiable.js";
import type {
  AccessibleData,
  ConditionalData,
  InteractiveData,
  LinkableData,
  RepeatableData,
  StylableData} from "./_common/_.js";
import {
  accessibleDataSchema,
  conditionalDataSchema,
  interactiveDataSchema,
  linkableDataSchema,
  repeatableDataSchema,
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
  })
  .passthrough();
