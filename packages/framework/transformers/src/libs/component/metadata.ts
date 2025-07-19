import { z } from "zod";

const elementMetadataSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
});

export type ElementMetadata = z.infer<typeof elementMetadataSchema>;

const elementsSchema = z.record(elementMetadataSchema);

const stageSchema = z.object({
  showInViewport: z.boolean().optional(),
  variants: z
    .array(
      z.object({
        name: z.string(),
        props: z.record(z.any()), // Replace z.any() with a more specific schema if you know props shape!
      }),
    )
    .optional(),
});

export const componentMetadataSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  elements: elementsSchema.optional(),
  stage: stageSchema.optional(),
});

export type ComponentMetadata = z.infer<typeof componentMetadataSchema>;
