import { useObservable } from "@repo/utils";
import { useElllProject } from "./project";

export function useProjectTypefaces() {
  const project = useElllProject();
  const typefaces = useObservable(
    project.styleManager.typefaceSheet.typefaces$,
    project.styleManager.typefaceSheet.typefaces,
  );

  return typefaces;
}
