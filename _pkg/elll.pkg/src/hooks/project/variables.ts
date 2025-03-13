import { useObservable } from "@repo/utils";
import { useElllProject } from "./project";

export function useProjectVariableSets() {
  const project = useElllProject();
  const sets = useObservable(
    project?.styleManager.variableSheet.sets$,
    project?.styleManager.variableSheet.sets,
  );
  return sets;
}

export function useProjectVariable(name: string) {
  const project = useElllProject();
  const variable = useObservable(
    project?.styleManager.variableSheet.variable$(name),
    project?.styleManager.variableSheet.variable(name),
  );
  return variable;
}
