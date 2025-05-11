import { useObservable } from "@elllphnt/elementa-utils";
import { useCallback } from "react";
import { ElementaEditorMode } from "~/src/_lib/mode";
import { useElementaInteractor } from "~/src/hooks/elementa_interactor";

export function useEditorMode() {
  const editor = useElementaInteractor();
  const mode = useObservable(editor.stager.mode$, editor.stager.mode);
  const setMode = useCallback(
    (mode: ElementaEditorMode) => editor.stager.setMode(mode),
    [editor.stager]
  );

  return [mode, setMode] as const;
}
