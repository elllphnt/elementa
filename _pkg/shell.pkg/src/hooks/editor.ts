import { useObservable } from "@repo/utils";
import { useShell } from "./shell";
import { useWorkspace } from "./workspace";

export function useActiveEditor() {
  const workspace = useWorkspace();
  const activeEditorState = useObservable(
    workspace.activeEditor$,
    workspace.activeEditor,
  );
  return activeEditorState;
}

export function useActiveEditorView(key: string) {
  const shell = useShell();
  const activeEditorState = useActiveEditor();
  const editorId = activeEditorState?.editorId;
  const editor = useObservable(
    editorId ? shell.editor$(editorId) : undefined,
    editorId ? shell.editor(editorId) : undefined,
  );
  return editor?.views[key];
}
