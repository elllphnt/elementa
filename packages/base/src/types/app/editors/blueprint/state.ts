import { z } from "zod";

// Types

export type BlueprintNodeData = {
  position: {
    x: number;
    y: number;
  };
};

export type BlueprintAppStateData = {
  nodes: Record<string, BlueprintNodeData>;
};

// Schemas

export const blueprintNodeDataSchema = z.object({
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
});

export const blueprintAppStateDataSchema = z.object({
  nodes: z.record(blueprintNodeDataSchema),
});
