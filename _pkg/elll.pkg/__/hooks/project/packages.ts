import { useObservable } from "@repo/utils";
import { useElllProject } from "./project";

export function useProjectPackages() {
  const project = useElllProject();
  const packages = useObservable(
    project.packageManager.packages$,
    project.packageManager.packages,
  );
  return packages;
}
