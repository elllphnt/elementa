import { LengthData, PercentData, ResolvableOrEvaluable } from "../../_.js";
import { Evaluable } from "../../_primitives/dynamic/evaluable.js";
import { BaseElementData } from "./_base.js";

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

export type MediaElementData = BaseElementData & {
  type: "media";
  fit?: Evaluable<"contain" | "cover" | "fill" | "none" | "scale-down">;
  position?: {
    x?: Evaluable<LengthData | PercentData>;
    y?: Evaluable<LengthData | PercentData>;
  };
  media?: MediaData;
};
