import { z } from "zod";
import {
  LengthData,
  PercentData,
  ResolvableOrEvaluable,
  resolvableOrEvaluableSchema,
} from "../../_primitives/_.js";
import {
  Evaluable,
  evaluableSchema,
} from "../../_primitives/dynamic/evaluable.js";
import { BaseElementData, baseElementDataSchema } from "./_base.js";

// Types

export type BaseMediaData = {
  src?: ResolvableOrEvaluable<string>;
};

export type ImageMediaData = BaseMediaData & {
  type: "image";
  alt?: Evaluable<string>;
};

export type VideoMediaData = BaseMediaData & {
  type: "video";
  autoplay?: Evaluable<string>;
  loop?: Evaluable<string>;
  muted?: Evaluable<string>;
  controls?: Evaluable<string>;
  poster?: ResolvableOrEvaluable<string>;
};

export type MediaData = ImageMediaData | VideoMediaData;

export type MediaElementData = BaseElementData<"media"> & {
  fit?: Evaluable<"contain" | "cover" | "fill" | "none" | "scale-down">;
  position?: {
    x?: Evaluable<LengthData | PercentData>;
    y?: Evaluable<LengthData | PercentData>;
  };
  media?: MediaData;
};

// Schemas

const baseMediaDataSchema = z.object({
  src: resolvableOrEvaluableSchema(z.string()).optional(),
});

const imageMediaDataSchema = baseMediaDataSchema.extend({
  type: z.literal("image"),
  alt: evaluableSchema(z.string()).optional(),
});

const videoMediaDataSchema = baseMediaDataSchema.extend({
  type: z.literal("video"),
  autoplay: evaluableSchema(z.string()).optional(),
  loop: evaluableSchema(z.string()).optional(),
  muted: evaluableSchema(z.string()).optional(),
  controls: evaluableSchema(z.string()).optional(),
  poster: resolvableOrEvaluableSchema(z.string()).optional(),
});

const mediaDataSchema = z.union([imageMediaDataSchema, videoMediaDataSchema]);

export const mediaElementDataSchema = baseElementDataSchema.extend({
  type: z.literal("media"),
  fit: evaluableSchema(
    z.enum(["contain", "cover", "fill", "none", "scale-down"])
  ).optional(),
  position: z
    .object({
      x: evaluableSchema(
        z.union([
          z.object({
            value: z.number(),
            unit: z.enum(["px", "em", "rem", "vh", "vw"]),
          }),
          z.object({ value: z.number(), unit: z.literal("%") }),
        ])
      ).optional(),
      y: evaluableSchema(
        z.union([
          z.object({
            value: z.number(),
            unit: z.enum(["px", "em", "rem", "vh", "vw"]),
          }),
          z.object({ value: z.number(), unit: z.literal("%") }),
        ])
      ).optional(),
    })
    .optional(),
  media: mediaDataSchema.optional(),
});
