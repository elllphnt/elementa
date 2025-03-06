import { BlueprintEditorState } from "~/src/editors/blueprint";
import { BlueprintEditor } from "./editor";

export function BlueprintBoardView({
  editor,
}: {
  editor: BlueprintEditorState;
}): JSX.Element {
  return <BlueprintEditor blueprint={editor.blueprint} />;
}
