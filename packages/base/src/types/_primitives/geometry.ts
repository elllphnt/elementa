import { z } from "zod";

// Types

export type AxisData<T> = {
  x?: T;
  y?: T;
};

export type EdgeData<T> = {
  top?: T;
  right?: T;
  bottom?: T;
  left?: T;
};

export type CornerData<T> = {
  topLeft?: T;
  topRight?: T;
  bottomRight?: T;
  bottomLeft?: T;
};

export type AreaData<T> = {
  x?: T;
  y?: T;
};

// Schemas

export const axisDataSchema = <T extends z.ZodTypeAny>(valueSchema: T) =>
  z.object({
    x: valueSchema.optional(),
    y: valueSchema.optional(),
  });

export const edgeDataSchema = <T extends z.ZodTypeAny>(valueSchema: T) =>
  z.object({
    top: valueSchema.optional(),
    right: valueSchema.optional(),
    bottom: valueSchema.optional(),
    left: valueSchema.optional(),
  });

export const cornerDataSchema = <T extends z.ZodTypeAny>(valueSchema: T) =>
  z.object({
    topLeft: valueSchema.optional(),
    topRight: valueSchema.optional(),
    bottomRight: valueSchema.optional(),
    bottomLeft: valueSchema.optional(),
  });

export const areaDataSchema = <T extends z.ZodTypeAny>(valueSchema: T) =>
  z.object({
    x: valueSchema.optional(),
    y: valueSchema.optional(),
  });
