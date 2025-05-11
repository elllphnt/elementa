import { z } from "zod";
import { Evaluable, evaluableSchema } from "../../_primitives/_.js";
import { BaseElementData, baseElementDataSchema } from "./_base.js";

export type VectorTextNodeData = {
  type: "text";
  value: string;
};

export type VectorElementNodeData = {
  type: "element";
  tagName: string;
  properties?: Record<string, any>;
  children: VectorNodeData[];
};

export type VectorNodeData = VectorTextNodeData | VectorElementNodeData;

export type VectorElementData = BaseElementData & {
  type: "vector";
  width?: Evaluable<string | number>;
  height?: Evaluable<string | number>;
  viewBox?: Evaluable<string>;
  preserveAspectRatio?: Evaluable<string>;
  content?: VectorNodeData[];
};

// Schemas

export const vectorTextNodeDataSchema = z.object({
  type: z.literal("text"),
  value: z.string(),
});

export const vectorElementNodeDataSchema = z.object({
  type: z.literal("element"),
  tagName: z.string(),
  properties: z.record(z.any()).optional(),
  children: z.lazy(() => z.array(vectorNodeDataSchema)),
});

export const vectorNodeDataSchema: z.ZodType<VectorNodeData> = z.lazy(() =>
  z.union([vectorTextNodeDataSchema, vectorElementNodeDataSchema])
);

export const vectorElementDataSchema = baseElementDataSchema.extend({
  type: z.literal("vector"),
  width: evaluableSchema(z.union([z.string(), z.number()])).optional(),
  height: evaluableSchema(z.union([z.string(), z.number()])).optional(),
  viewBox: evaluableSchema(z.string()).optional(),
  preserveAspectRatio: evaluableSchema(z.string()).optional(),
  content: z.array(vectorNodeDataSchema).optional(),
});
