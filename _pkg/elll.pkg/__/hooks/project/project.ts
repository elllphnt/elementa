import { useObservable } from "@repo/utils";
import { useElll } from "../elll/elll";

export function useElllProject() {
  const elll = useElll();
  return elll.project;
}

export function useProjectTypefaces() {
  const project = useElllProject();
  return useObservable(
    project.typefaceManager.typefaces$,
    project.typefaceManager.typefaces,
  );
}

export function useProjectTypeface(id: string) {
  const project = useElllProject();
  return useObservable(
    project.typefaceManager.typeface$(id),
    project.typefaceManager.typeface(id),
  );
}
