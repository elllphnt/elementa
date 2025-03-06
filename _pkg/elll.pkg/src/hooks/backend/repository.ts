import { useObservable } from "@repo/utils";
import { useElll } from "../elll/elll";

export function useRepository() {
  const elll = useElll();
  return useObservable(elll.repository$, elll.repository);
}
