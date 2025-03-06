import { ScrollArea } from "@repo/components";
import { ElementaEditor } from "@repo/elementa";
import { useObservable } from "@repo/utils";
import { FrameWidgetOutline } from "./widgets/frame";

function NoContent() {
  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 32,
        textAlign: "center",
      }}
      className="el-text-fg-400 el-text-sm"
    >
      <p>No content in the current canvas.</p>
    </div>
  );
}

export function ViewOutline({
  editor,
  stateKey = [],
}: {
  editor: ElementaEditor;
  stateKey?: string[];
}): JSX.Element {
  const frames = useObservable(editor.frameHandles$, editor.frameHandles);

  if (!frames.length) {
    return <NoContent />;
  }

  return (
    <ScrollArea scrollY containerClassName="el-px-2 el-pb-2 el-space-y-0.5">
      {frames.map((frame) => (
        <FrameWidgetOutline
          key={frame.key}
          widget={frame}
          stateKey={[...stateKey, "frames", `${frame.id}`]}
        />
      ))}
    </ScrollArea>
  );
}
