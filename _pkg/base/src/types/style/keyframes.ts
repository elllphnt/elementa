import { z } from "zod";
import type { StyleData } from "./stylesheet/_.js";
import {
  StyleFragmentData,
  styleFragmentDataSchema,
} from "./stylesheet/fragments/fragment.js";

// Types

export type KeyFrameData = {
  key?: string;
  offset?: number;
  style?: StyleData;
};

export type KeyframeSetData = {
  id?: string;
  name?: string;
  keyframes?: KeyFrameData[];
  styleFragments?: StyleFragmentData[];
};

// Schemas

export const keyFrameDataSchema = z.object({
  key: z.string().optional(),
  offset: z.number().optional(),
  style: z.record(z.unknown()).optional(),
});

export const keyframeSetDataSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  keyframes: z.array(keyFrameDataSchema).optional(),
  styleFragments: z.array(styleFragmentDataSchema).optional(),
});
