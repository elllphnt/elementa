import { z } from "zod";
import { StyleDataType } from "../_primitives/_.js";
import type {
  CrdtAtomic,
  IdentifiableData} from "../_shared/_.js";
import {
  crdtAtomicSchema
} from "../_shared/_.js";
import { type ElllSelectorData, elllSelectorDataSchema } from "./modifier.js";

// Types

export type StyleVariableData = CrdtAtomic<["values"]> & {
  name?: string;
  values?: Record<string, any>;
};

export type StyleVariableSetData = IdentifiableData & {
  name: string;
  datatype?: StyleDataType;
  modes?: ElllSelectorData[];
  variables: StyleVariableData[];
};

export type StyleVariableSheetData = {
  variables: StyleVariableSetData[];
};

// Schemas

export const styleVariableDataSchema = crdtAtomicSchema(["values"]).extend({
  name: z.string().optional(),
  values: z.record(z.any()).optional(),
});

export const styleVariableSetDataSchema = z.object({
  id: z.string(),
  name: z.string(),
  datatype: z.nativeEnum(StyleDataType).optional(),
  modes: z.array(elllSelectorDataSchema).optional(),
  variables: z.array(styleVariableDataSchema),
});

export const styleVariableSheetSchema = {
  variables: z.array(styleVariableSetDataSchema),
};
