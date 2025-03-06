import { useObservable } from "@repo/utils";
import { ElementaEditorMode } from "~/src/_lib/mode";
import { useElementaInteractor } from "../../../hooks/elementa_interactor";
import { ConnectionHandleComponent } from "../../handles/interactions/connection";

export function SelectionFlowHandle() {
  const editor = useElementaInteractor();
  const selection = useObservable(
    editor.interactionManager.selection$,
    editor.interactionManager.selection,
  );

  return (
    <>
      {selection.map((handle) => (
        <ConnectionHandleComponent key={handle.key} handle={handle} />
      ))}
    </>
  );
}

export function WidgetSelectionLayer() {
  const editor = useElementaInteractor();
  const ready = useObservable(editor.stager.ready$, false);
  const moving = useObservable(editor.stager.flag$("moving"), false);
  const dragging = useObservable(editor.stager.flag$("dragging"), false);
  const editorMode = useObservable(editor.stager.mode$, editor.stager.mode);

  if (!ready || moving || dragging) return null;

  if (editorMode === ElementaEditorMode.Flow) {
    return <SelectionFlowHandle />;
  } else {
    return <></>;
  }
}
