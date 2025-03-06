import { useObservable } from "@repo/utils";
import { useElllProject } from "./project";

export function useProjectTransitions() {
  const project = useElllProject();
  let transitions = useObservable(
    project.transitionStore.transitions$,
    project.transitionStore.transitions,
  );

  return transitions;
}

export function useProjectTransition(id?: string) {
  const project = useElllProject();
  let transition = useObservable(
    project.transitionStore.transition$(id ?? ""),
    project.transitionStore.transition(id ?? ""),
  );

  return transition;
}
