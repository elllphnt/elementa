import { useObservable } from "@repo/utils";
import { useElllProject } from "./project";

export function useProjectThemes() {
  const project = useElllProject();
  return useObservable(project.themeStore.themes$, project.themeStore.themes);
}
