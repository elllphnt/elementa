import {
  FragmentInstance,
  FrameWidgetInstance,
  PageElementInstance,
} from "@repo/elementa";
import { useManyObservables } from "@repo/utils";

export function useFrameStyles(frames: FrameWidgetInstance[]) {
  return frames.map((instance) => instance.entity.style);
}

export function useFramePageStyles(frames: FrameWidgetInstance[]) {
  const key = frames.map((instance) => instance.key).join(".");
  const fragments = useManyObservables(
    frames.map((instance) => instance.fragment$),
    frames.map((instance) => instance.fragment),
    key,
  ).filter(Boolean) as FragmentInstance[];
  const pages = useManyObservables(
    fragments.map((fragment) => fragment.page$),
    fragments.map((fragment) => fragment.page),
    key,
  ).filter(Boolean) as PageElementInstance[];
  const styles = pages.map((page) => page.style);

  return styles;
}
