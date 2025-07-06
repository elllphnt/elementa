import { z } from "zod";
import { StyleDataType } from "../_primitives/_.js";
import type {
  CrdtAtomic,
  IdentifiableData} from "../_shared/_.js";
import {
  crdtAtomicSchema
} from "../_shared/_.js";

// Types

export enum StyleModifierType {
  Context = "context",
  Element = "element",
}

export type StyleModifierDefinitionData = CrdtAtomic<
  ["signature", "selector"]
> &
  IdentifiableData & {
    name: string;
    type: StyleModifierType;
    signature?: StyleDataType[];
    predecence?: number;
    selector?: string[];
  };

export type StyleModifierData = {
  name: string;
  args?: any[];
};

export type ElllSelectorData = StyleModifierData[];

export type StyleModifierSheetData = CrdtAtomic<["modifiers[*]"]> & {
  modifiers: StyleModifierDefinitionData[];
};

// Schemas

export const styleModifierDefinitionDataSchema = crdtAtomicSchema([
  "signature",
  "selector",
]).extend({
  id: z.string(),
  name: z.string(),
  type: z.enum([StyleModifierType.Context, StyleModifierType.Element]),
  signature: z.array(z.nativeEnum(StyleDataType)).optional(),
  predecence: z.number().optional(),
  selector: z.array(z.string()).optional(),
});

export const styleModifierDataSchema = z.object({
  name: z.string(),
  args: z.array(z.any()).optional(),
});

export const elllSelectorDataSchema = z.array(styleModifierDataSchema);

export const styleModifierSheetSchema = crdtAtomicSchema([
  "modifiers[*]",
]).extend({
  modifiers: z.array(styleModifierDefinitionDataSchema).default([]),
});
