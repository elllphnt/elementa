import { useShell } from "@repo/shell";
import { useObservable } from "@repo/utils";
import { ContentEditorState } from "../../editors/content";

export function useActiveEditor() {
  const shell = useShell();
  const activeEditor = useObservable(
    shell.workspace.activeEditor$,
    shell.workspace.activeEditor,
  );
  return activeEditor;
}

export function useActiveContentEditor() {
  const activeEditor = useActiveEditor();
  if (!(activeEditor instanceof ContentEditorState)) {
    return undefined;
  }
  return activeEditor;
}
