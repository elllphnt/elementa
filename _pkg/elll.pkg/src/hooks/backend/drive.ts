import { useObservable } from "@repo/utils";
import { useTenant } from "./tenant";

export function useDrive() {
  const tenant = useTenant();
  return useObservable(tenant?.drive$, tenant?.drive);
}
