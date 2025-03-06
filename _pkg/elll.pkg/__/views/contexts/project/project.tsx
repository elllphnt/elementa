import { Handle } from "@repo/elementa";
import { ProjectDefaultContextPanel } from "./default";

export function ProjectContextPanel({
  selection,
  stateKey,
}: {
  selection: Handle[];
  stateKey: string[];
}): JSX.Element {
  return (
    <ProjectDefaultContextPanel selection={selection} stateKey={stateKey} />
  );
}
