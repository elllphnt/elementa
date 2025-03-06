import { useObservable } from "@repo/utils";
import { Workspace } from "~/src/models/workspace";

export function useAllContexts(workspace: Workspace) {
  const editor = useObservable(workspace.activeEditor$, workspace.activeEditor);
  const workspaceContexts = useObservable(
    workspace.contexts$,
    workspace.contexts,
  );
  const editorContexts = useObservable(
    editor?.contexts$,
    editor?.contexts,
    editor?.key,
  );
  const allContexts = [
    ...(workspaceContexts ?? []),
    ...(editorContexts ?? []),
  ].sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0));

  return allContexts;
}
