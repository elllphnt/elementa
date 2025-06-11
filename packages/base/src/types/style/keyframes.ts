import { z } from "zod";
import { IdentifiableData } from "../_shared/_.js";
import type { StyleData } from "./stylesheet/_.js";
import {
  StyleFragmentData,
  styleFragmentDataSchema,
} from "./stylesheet/fragments/fragment.js";

// Types

export type KeyFrameData = {
  offset?: number;
  style?: StyleData;
};

export type KeyframeSetData = IdentifiableData & {
  name?: string;
  keyframes?: KeyFrameData[];
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
