import { useObservable } from "@repo/utils";
import { useElllProject } from "./project";

export function useProjectLibraries() {
  const project = useElllProject();
  const libraries = useObservable(
    project.libraryManager.libraries$,
    project.libraryManager.libraries,
  );
  return libraries;
}
