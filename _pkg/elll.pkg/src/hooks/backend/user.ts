import { useObservable } from "@repo/utils";
import { useElll } from "../elll/elll";

export function useUser() {
  const elll = useElll();
  return useObservable(elll.user$, elll.user);
}
