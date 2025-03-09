import {
  FragmentHandle,
  FrameWidgetHandle,
  PageElementHandle,
} from "@repo/elementa-interactor";
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
  const styles = pages.map((page) => page.style);

  return styles;
}
