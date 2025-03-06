import { useObservable } from "@repo/utils";
import { UtilitySheetEditorState } from "~/src/editors/utility_sheet";
import UtilitySheetEditor from "./editor";

export function UtilitySheetBoardView({
  editor,
}: {
  editor: UtilitySheetEditorState;
}) {
  const sets = useObservable(
    editor.utilityManager.sets$,
    editor.utilityManager.sets,
  );
  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        pointerEvents: "auto",
      }}
    >
      <UtilitySheetEditor
        sets={Object.values(sets)}
        onUpdate={function (): void {}}
      />
    </div>
  );
}
