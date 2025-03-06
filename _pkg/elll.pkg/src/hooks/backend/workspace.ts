import { useObservable } from "@repo/utils";
import { useRepository } from "./repository";

export function useWorkspace() {
  const repository = useRepository();
  return useObservable(repository?.workspace$, repository?.workspace);
}
