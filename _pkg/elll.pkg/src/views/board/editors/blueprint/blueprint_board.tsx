import { BlueprintEditorState } from "~/src/editors/blueprint/blueprint";
import { BlueprintEditorComponent } from "./editor";

export function BlueprintBoardView({
  editor,
}: {
  editor: BlueprintEditorState;
}): JSX.Element {
  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        pointerEvents: "auto",
      }}
    >
      <BlueprintEditorComponent editor={editor.blueprintEditor} />
    </div>
  );
}
