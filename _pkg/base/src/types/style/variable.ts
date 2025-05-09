import { z } from "zod";
import { StyleDataType } from "../_.js";
import { elllSelectorDataSchema } from "./modifier.js";

// Types

export type StyleVariableData = {
  name?: string;
  values?: Record<string, unknown>;
};

export type StyleVariableSetData = {
  id: string;
  name: string;
  datatype?: StyleDataType;
  modes?: ElllSelectorData[];
  variables: StyleVariableData[];
};

// Schemas

export const styleVariableDataSchema = z.object({
  name: z.string().optional(),
  values: z.record(z.unknown()).optional(),
});

export const styleVariableSetDataSchema = z.object({
  id: z.string(),
  name: z.string(),
  datatype: z.nativeEnum(StyleDataType).optional(),
  modes: z.array(elllSelectorDataSchema).optional(),
  variables: z.array(styleVariableDataSchema),
});
