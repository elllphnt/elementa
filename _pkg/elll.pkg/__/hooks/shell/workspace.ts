import { useShell } from "@repo/shell";
import { useObservable } from "@repo/utils";
import _ from "lodash";
import { useCallback } from "react";

export function useWorkspaceState<T>(
  key: _.PropertyPath,
  defaultValue?: T
): [T, (value: T) => void] {
  const shell = useShell();
  const workspace = useObservable(shell.workspace$, shell.workspace);
  const state = useObservable(
    workspace.state.value$(key, defaultValue),
    workspace.state.value(key, defaultValue)
  );
  const setState = useCallback(
    (value: any) => {
      workspace.state.set(key, value);
    },
    [workspace, key]
  );

  return [state, setState] as any;
}
