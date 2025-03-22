import {
  FragmentHandle,
  FrameWidgetHandle,
  PageElementHandle,
} from "@repo/elementa-interactor";
import { Style } from "@repo/elementa-models";
import { useManyObservables } from "@repo/utils";

export function useFramePageStyles(frames: FrameWidgetHandle[]) {
  const key = frames.map((instance) => instance.key).join(".");
  const fragments = useManyObservables(
    frames.map((instance) => instance.fragment$),
    frames.map((instance) => instance.fragment),
    key,
  ).filter(Boolean) as FragmentHandle[];
  const pages = useManyObservables(
    fragments.map((fragment) => fragment.page$),
    fragments.map((fragment) => fragment.page),
    key,
  ).filter(Boolean) as PageElementHandle[];
  const instanceStyles = pages.map((page) => page.style);
  const styles = useManyObservables(
    instanceStyles.map((style) => style.style$),
    instanceStyles.map((style) => style.style),
    instanceStyles.map((style) => style.key).join("."),
  ).filter(Boolean) as Style[];

  return styles;
}
