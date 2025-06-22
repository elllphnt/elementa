import { z } from "zod";
import { CrdtAtomic, crdtAtomicSchema } from "../../_shared/_.js";

// Types

export type BlueprintNodeData = CrdtAtomic<["position"]> & {
  id: string;
  position: {
    x: number;
    y: number;
  };
};

export type BlueprintData = {
  nodes?: BlueprintNodeData[];
};

// Schemas

export const blueprintNodeDataSchema = crdtAtomicSchema(["position"]).extend({
  id: z.string(),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
});

export const appBlueprintDataSchema = z.object({
  nodes: z.array(blueprintNodeDataSchema).optional(),
});
