import { ElementInstance } from "@repo/elementa";
import { useElementStyles } from "../../../../../../hooks/elementa/element";
import { TextStyleControl } from "../../../_common/_fragments/text";

export function ContainerTextControlSheet({
  instances,
}: {
  instances: ElementInstance[];
}): JSX.Element {
  const styles = useElementStyles(instances);

  return <TextStyleControl styles={styles as any} />;
}
