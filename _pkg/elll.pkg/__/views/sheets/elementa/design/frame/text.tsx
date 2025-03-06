import { FrameWidgetInstance } from "@repo/elementa";
import { useFramePageStyles } from "../../../../../hooks/elementa/frame";
import { TextStyleControl } from "../../_common/_fragments/text";

export function FrameTextControlSheet({
  instances,
}: {
  instances: FrameWidgetInstance[];
}): JSX.Element {
  const styles = useFramePageStyles(instances);

  return <TextStyleControl styles={styles as any} />;
}
