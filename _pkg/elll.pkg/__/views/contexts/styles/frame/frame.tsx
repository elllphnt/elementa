import { FrameWidgetHandle } from "@repo/elementa";
import { useManyObservables } from "@repo/utils";
import { FrameFrameStylesPanel } from "./frame_styles";
import { FramePageStylesPanel } from "./page_styles";

export function FrameStylesPanel({
  selection,
  stateKey,
}: {
  selection: FrameWidgetHandle[];
  stateKey: string[];
}): JSX.Element {
  const viewports = useManyObservables(
    selection.map((handle) => handle.entity.viewport$),
    selection.map((handle) => handle.entity.viewport),
    selection.map((handle) => handle.key).join(","),
  );

  const allViewport = viewports.every(Boolean);
  const allNoViewport = viewports.every((viewport) => !viewport);

  if (allViewport) {
    return <FramePageStylesPanel selection={selection} stateKey={stateKey} />;
  } else if (allNoViewport) {
    return <FrameFrameStylesPanel selection={selection} stateKey={stateKey} />;
  } else {
    return (
      <div className="el-p-3 el-text-center el-space-y-2 el-text-sm">
        <p>Frames with mixed viewport settings.</p>
        <p>Select frames with the same viewport settings to edit styles.</p>
      </div>
    );
  }
}
