import { z } from "zod";

// Types

export enum StyleFragmentType {
  Animation = "animation",
  BackgroundLayer = "backgroundLayer",
  Filter = "filter",
}

export type StyleFragmentDataTypeMap = {
  [StyleFragmentType.Animation]: unknown;
  [StyleFragmentType.BackgroundLayer]: unknown;
  [StyleFragmentType.Filter]: unknown;
};

export type StyleFragmentData<T extends StyleFragmentType = StyleFragmentType> =
  {
    id: string;
    type: T;
    data: StyleFragmentDataTypeMap[T];
  };

// Schemas

export const styleFragmentDataSchema = z.object({
  id: z.string(),
  type: z.string(), // loose check, not strict enum
  data: z.unknown(),
});
