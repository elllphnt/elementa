import { ElementHandle } from "@repo/elementa";
import { useManyObservables } from "@repo/utils";
import { StyleEditor } from "~/src/components/styles/style_editor";

export function ElementStylesPanel({
  selection,
  stateKey,
}: {
  selection: ElementHandle[];
  stateKey: string[];
}): JSX.Element {
  const stylesheets = selection.map((handle) => handle.entity.stylesheet);
  const styles = useManyObservables(
    stylesheets.map((a) => a.style$("base", true)),
    stylesheets.map((a) => a.style("base", true)),
    stylesheets.map((a) => a.key).join(","),
  );

  return <StyleEditor styles={styles} />;
}
