import type { AnimationData} from "@elllphnt/elementa-base";
import { StyleDataType } from "@elllphnt/elementa-base";
import { variableStyleDataToCss } from "../variable.js";

export function animationToCss(animation: AnimationData): string {
  const parts: string[] = [];
  if (animation.keyframe) {
    parts.push(
      variableStyleDataToCss(StyleDataType.String, animation.keyframe)
    );
  }
  if (animation.duration && animation.delay) {
    parts.push(
      variableStyleDataToCss(StyleDataType.Duration, animation.duration),
      variableStyleDataToCss(StyleDataType.Duration, animation.delay)
    );
  } else if (animation.duration) {
    parts.push(
      variableStyleDataToCss(StyleDataType.Duration, animation.duration)
    );
  } else if (animation.delay) {
    parts.push(
      "0s",
      variableStyleDataToCss(StyleDataType.Duration, animation.delay)
    );
  }
  if (animation.timingFunction) {
    parts.push(
      variableStyleDataToCss(StyleDataType.String, animation.timingFunction)
    );
  }
  if (animation.iterations) {
    parts.push(
      variableStyleDataToCss(StyleDataType.Number, animation.iterations)
    );
  }
  if (animation.direction) {
    parts.push(
      variableStyleDataToCss(StyleDataType.String, animation.direction)
    );
  }
  if (animation.fillMode) {
    parts.push(
      variableStyleDataToCss(StyleDataType.String, animation.fillMode)
    );
  }
  if (animation.playState) {
    parts.push(
      variableStyleDataToCss(StyleDataType.String, animation.playState)
    );
  }
  return parts.join(" ");
}
