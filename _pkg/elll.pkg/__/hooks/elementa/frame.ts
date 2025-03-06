import {
  ElementInstanceStyle,
  FrameStyle,
  FrameWidgetInstance,
} from "@repo/elementa";
import { useManyObservables } from "@repo/utils";

export function useFrameRootStyles(frames: FrameWidgetInstance[]) {
  const key = frames.map((instance) => instance.key).join(".");
  const styles = useManyObservables(
    frames.map((instance) => instance.rootStyle$),
    frames.map((instance) => instance.rootStyle),
    key,
  ).filter(Boolean) as (ElementInstanceStyle | FrameStyle)[];
  return styles;
}
export function useFramePageStyles(frames: FrameWidgetInstance[]) {
  const key = frames.map((instance) => instance.key).join(".");
  const styles = useManyObservables(
    frames.map((instance) => instance.pageStyle$),
    frames.map((instance) => instance.pageStyle),
    key,
  ).filter(Boolean) as (ElementInstanceStyle | FrameStyle)[];

  return styles;
}
