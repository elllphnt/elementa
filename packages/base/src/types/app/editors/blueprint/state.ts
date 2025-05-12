import { z } from "zod";

// Types

export type BlueprintNodeData = {
  position: {
    x: number;
    y: number;
  };
};

export type AppBlueprintData = {
  nodes: Record<string, BlueprintNodeData>;
};

// Schemas

export const blueprintNodeDataSchema = z.object({
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
});

export const appBlueprintDataSchema = z.object({
  nodes: z.record(blueprintNodeDataSchema),
});
