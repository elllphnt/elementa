import { useObservable } from "@repo/utils";
import { VariableSheetEditorState } from "~/src/editors/variable_sheet";
import VariableSheetEditor from "./editor";

export function VariableSheetBoardView({
  editor,
}: {
  editor: VariableSheetEditorState;
}) {
  const sheet = useObservable(editor.variableSheet$, editor.variableSheet);
  if (!sheet) {
    return null;
  }

  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        pointerEvents: "auto",
      }}
    >
      <VariableSheetEditor sheet={sheet} />
    </div>
  );
}
