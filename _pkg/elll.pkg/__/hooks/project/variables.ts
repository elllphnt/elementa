import { useManyObservables, useObservable } from "@repo/utils";
import { useElllProject } from "./project";

export function useProjectVariables({
  types,
}: {
  types?: string[];
} = {}) {
  const project = useElllProject();
  let variables = useObservable(
    project.variableStore.variables$,
    project.variableStore.variables,
  );
  const variablesKey = variables.map((variable) => variable.key).join(",");
  const dataTypes = useManyObservables(
    variables.map((variable) => variable.datatype$),
    variables.map((variable) => variable.datatype),
    variablesKey,
  );

  if (types) {
    variables = variables.filter((_, index) => {
      const type = dataTypes[index];
      return type && types.includes(type);
    });
  }

  return variables;
}

export function useProjectVariable(id?: string) {
  const project = useElllProject();
  let variables = useObservable(
    project.variableStore.variables$,
    project.variableStore.variables,
  );

  return variables.find((variable) => variable.id === id);
}
