import { mixed, resolveCommonValue } from "@repo/components";
import { ElementHandle } from "@repo/elementa";
import { useManyObservables } from "@repo/utils";
import { activeControlPanelKey } from "./_libs";
import { AnimationPropertiesPanel } from "./panels/animation";
import { ElementGeneralPropertiesPanel } from "./panels/general";
import { StylePropertiesPanel } from "./panels/style";
import { CodeComponentStylesheetPropertiesPanel } from "./panels/stylesheet";

export function ElementPropertiesPanel({
  selection,
  stateKey,
}: {
  selection: ElementHandle[];
  stateKey: string[];
}): JSX.Element {
  const activeControlPanels = useManyObservables(
    selection.map((a) => a.entity.editorState$(activeControlPanelKey)),
    selection.map((a) => a.entity.editorState(activeControlPanelKey)),
    selection.map((a) => a.key).join(","),
  ) as (string | undefined)[];
  const activeControlPanel = resolveCommonValue(activeControlPanels);

  if (!activeControlPanel || activeControlPanel === mixed) {
    return (
      <ElementGeneralPropertiesPanel
        selection={selection}
        stateKey={stateKey}
      />
    );
  }

  const [panel, args] = activeControlPanel.split(":", 2);

  switch (panel) {
    case "stylesheet":
      return (
        <CodeComponentStylesheetPropertiesPanel
          selection={selection}
          stateKey={stateKey}
          args={args}
        />
      );
    case "style":
      return (
        <StylePropertiesPanel
          selection={selection}
          stateKey={stateKey}
          args={args}
        />
      );
    case "animation":
      return (
        <AnimationPropertiesPanel
          selection={selection}
          stateKey={stateKey}
          args={args}
        />
      );
    default:
      return (
        <ElementGeneralPropertiesPanel
          selection={selection}
          stateKey={stateKey}
        />
      );
  }
}
