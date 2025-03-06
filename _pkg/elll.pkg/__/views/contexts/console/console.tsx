import { Handle } from "@repo/elementa";
import { useManyObservables } from "@repo/utils";
import DiagnosticCard from "./diagnostic";
import * as Accordion from "@radix-ui/react-accordion";

export function IssuesPanel({
  selection,
  stateKey,
}: {
  selection: Handle[];
  stateKey: string[];
}): JSX.Element {
  const diagnostics = useManyObservables(
    selection.map((handle) => handle.instance.diagnostics$),
    selection.map((handle) => handle.instance.diagnostics),
    selection.map((handle) => handle.key).join("-"),
  ).flat();

  return (
    <div className="el-h-full el-w-full el-p-2 el-space-y-2">
      {diagnostics.map((diagnostic, index) => (
        <DiagnosticCard key={index} diagnostic={diagnostic} />
      ))}
    </div>
  );
}
