import { ElementInstance } from "@repo/elementa";
import { useElementStyles } from "../../../../../../hooks/elementa/element";
import { LayoutControls } from "../../../_common/_fragments/layout";

export function LayoutControlSheet({
  instances,
}: {
  instances: ElementInstance[];
}): JSX.Element {
  const styles = useElementStyles(instances);

  return <LayoutControls styles={styles as any} />;
}
