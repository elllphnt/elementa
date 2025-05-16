import { z } from "zod";

// Types

export type BlueprintNodeData = {
  id: string;
  position: {
    x: number;
    y: number;
  };
};

export type AppBlueprintData = {
  nodes?: BlueprintNodeData[];
};

// Schemas

export const blueprintNodeDataSchema = z.object({
  id: z.string(),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
});

export const appBlueprintDataSchema = z.object({
  nodes: z.array(blueprintNodeDataSchema),
});
