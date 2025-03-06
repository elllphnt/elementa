import { useObservable } from "@repo/utils";
import { useElll } from "../elll/elll";

export function useWorkspace() {
  const elll = useElll();
  return useObservable(elll.workspace$, elll.workspace);
}
