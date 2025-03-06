import { useObservable } from "@repo/utils";
import { useElllProject } from "./project";

export function useProjectKeyframeSets() {
  const project = useElllProject();
  let keyframeSets = useObservable(
    project.keyframeSetStore.keyframeSets$,
    project.keyframeSetStore.keyframeSets,
  );

  return keyframeSets;
}

export function useProjectKeyframeSet(id?: string) {
  const project = useElllProject();
  let keyframeset = useObservable(
    project.keyframeSetStore.keyframeSet$(id ?? ""),
    project.keyframeSetStore.keyframeSet(id ?? ""),
  );

  return keyframeset;
}
