import {
  FragmentHandle,
  FrameWidgetHandle,
  PageElementHandle,
} from "@repo/elementa";
import { useManyObservables } from "@repo/utils";
import { StyleEditor } from "~/src/components/styles/style_editor";

export function FramePageStylesPanel({
  selection,
  stateKey,
}: {
  selection: FrameWidgetHandle[];
  stateKey: string[];
}): JSX.Element {
  const fragments = useManyObservables(
    selection.map((a) => a.fragment$),
    selection.map((a) => a.fragment),
    selection.map((a) => a.key).join(","),
  ).filter(Boolean) as FragmentHandle[];
  const pages = useManyObservables(
    fragments.map((a) => a.page$),
    fragments.map((a) => a.page),
    fragments.map((a) => a.key).join(","),
  ).filter(Boolean) as PageElementHandle[];

  const stylesheets = pages.map((handle) => handle.entity.stylesheet);
  const styles = useManyObservables(
    stylesheets.map((a) => a.style$("base", true)),
    stylesheets.map((a) => a.style("base", true)),
    stylesheets.map((a) => a.key).join(","),
  );

  return (
    <StyleEditor
      styles={styles}
      disabled={["animation", "box", "position", "transform"]}
    />
  );
}
