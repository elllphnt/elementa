import { useObservable } from "@repo/utils";
import { useElllProject } from "./project";

export function useProjectLibraries() {
  const project = useElllProject();
  const libraries = useObservable(
    project.libraryStore.libraries$,
    project.libraryStore.libraries,
  );
  return libraries;
}
