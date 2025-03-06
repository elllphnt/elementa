import { useObservable } from "@repo/utils";
import { useElll } from "../elll/elll";

export function useTenant() {
  const elll = useElll();
  return useObservable(elll.tenant$, elll.tenant);
}
