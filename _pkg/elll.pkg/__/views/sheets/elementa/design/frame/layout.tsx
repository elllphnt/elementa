import { FrameWidgetInstance } from "@repo/elementa";
import { useWorkspaceState } from "~/src/hooks/shell/workspace";
import { useFramePageStyles } from "../../../../../hooks/elementa/frame";
import { useElllProject } from "../../../../../hooks/project/project";
import { LayoutControls } from "../../_common/_fragments/layout";

export function useElementContextScope() {
  return useWorkspaceState<string>(
    ["elementa", "context", "scope"],
    "component",
  );
}

function ComponentFrameLayoutControlSheet({
  instances,
}: {
  instances: FrameWidgetInstance[];
}): JSX.Element {
  const styles = useFramePageStyles(instances);
  return <LayoutControls styles={styles as any} />;
}
function ProjectFrameLayoutControlSheet(): JSX.Element {
  const project = useElllProject();
  const style = project.defaultPage?.style;
  const styles = style ? [style] : [];

  return <LayoutControls styles={styles as any} />;
}

export function FrameLayoutControlSheet({
  instances,
}: {
  instances: FrameWidgetInstance[];
}): JSX.Element {
  const [activeScope] = useElementContextScope();

  return activeScope === "component" ? (
    <ComponentFrameLayoutControlSheet instances={instances} />
  ) : (
    <ProjectFrameLayoutControlSheet />
  );
}
