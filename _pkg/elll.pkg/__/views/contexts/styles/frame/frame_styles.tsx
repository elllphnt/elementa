import { FrameWidgetHandle } from "@repo/elementa";
import { StyleEditor } from "~/src/components/styles/style_editor";

export function FrameFrameStylesPanel({
  selection,
  stateKey,
}: {
  selection: FrameWidgetHandle[];
  stateKey: string[];
}): JSX.Element {
  const styles = selection.map((handle) => handle.entity.style);
  return (
    <StyleEditor
      styles={styles}
      disabled={["animation", "box", "position", "transform"]}
    />
  );
}
