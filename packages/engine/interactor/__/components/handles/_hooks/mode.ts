import { useObservable } from "@elllphnt/elementa-utils";
import { useCallback } from "react";
import type { ElementaEditorMode } from "~/_lib/mode";
import { useElementaInteractor } from "~/hooks/elementa_interactor";

export function useEditorMode() {
  const editor = useElementaInteractor();
  const mode = useObservable(editor.stager.mode$, editor.stager.mode);
  const setMode = useCallback(
    (mode: ElementaEditorMode) => editor.stager.setMode(mode),
    [editor.stager]
  );

  return [mode, setMode] as const;
}
