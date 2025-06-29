import { z } from "zod";

// Types

export type VarRef<T = any> = {
  __var: string;
  options?: Record<string, any>;
  fallback?: T;
};

export type Variable<T> = T | VarRef<T>;
export type MapWithVarRefs<T extends Record<string, any>> = {
  [key in keyof T]?: T[key] | VarRef<T[key]>;
};

// Schemas

export const varRefSchema = <T extends z.ZodTypeAny>(valueSchema: T) =>
  z.object({
    __var: z.string(),
    options: z.record(z.any()).optional(),
    fallback: valueSchema.optional(),
  });

export const variableSchema = <Z extends z.ZodTypeAny>(valueSchema: Z) =>
  z.union([valueSchema, varRefSchema(valueSchema)]);

export const mapWithVarRefsSchema = <T extends Record<string, any>>(
  valueSchema: z.ZodType<T>
) =>
  z.record(z.union([valueSchema, varRefSchema(valueSchema)])) as z.ZodType<
    MapWithVarRefs<T>
  >;
