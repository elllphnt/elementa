import { z } from "zod";
import type { IdentifiableData } from "../../_shared/_.js";
import type { StyleFragmentData } from "./fragments/fragment.js";
import { styleFragmentDataSchema } from "./fragments/fragment.js";
import type { StyleData } from "./style/_.js";

// Types

export type KeyFrameGroupData = {
  offsets?: number[];
  style?: StyleData;
};

export type KeyframeSetData = IdentifiableData & {
  name?: string;
  groups?: KeyFrameGroupData[];
  styleFragments?: StyleFragmentData[];
};

export type KeyframeSheetData = {
  keyframes: KeyframeSetData[];
};

// Schemas

export const keyFrameDataSchema = z.object({
  key: z.string().optional(),
  offset: z.number().optional(),
  style: z.record(z.any()).optional(),
});

export const keyframeSetDataSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  keyframes: z.array(keyFrameDataSchema).optional(),
  styleFragments: z.array(styleFragmentDataSchema).optional(),
});

export const keyframeSheetSchema = z.object({
  keyframes: z.array(keyframeSetDataSchema).default([]),
});
