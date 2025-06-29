import { z } from "zod";

// Types

export type StaticReference<T = any> = {
  __reference: {
    type: string;
  };
  fallback?: T;
};
export type Resolvable<T> = T | StaticReference<T>;
export type StaticReferencee<T> = T extends Resolvable<infer U> ? U : T;

// Schemas

export const staticReferenceSchema = <T extends z.ZodTypeAny>(valueSchema: T) =>
  z.object({
    __reference: z.object({
      type: z.string(),
    }),
    fallback: valueSchema.optional(),
  });
export const resolvableSchema = <Z extends z.ZodTypeAny>(valueSchema: Z) =>
  z.union([valueSchema, staticReferenceSchema(valueSchema)]);
