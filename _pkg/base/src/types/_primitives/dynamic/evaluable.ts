import { z } from "zod";

// Types

export type Expression<T = unknown> = {
  __expression: string;
  fallback?: T;
};
export type Evaluable<T> = T | Expression<T>;
export type Evaluatee<T> = T extends Evaluable<infer U> ? U : T;

// Schemas

export const expressionSchema = <T extends z.ZodTypeAny>(valueSchema: T) =>
  z.object({
    __expression: z.string(),
    fallback: valueSchema.optional(),
  });
export const evaluableSchema = <Z extends z.ZodTypeAny>(valueSchema: Z) =>
  z.union([valueSchema, expressionSchema(valueSchema)]);
