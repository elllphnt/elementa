import { elllIcons16 } from "@repo/components";
import { ElementHandle } from "@repo/elementa";
import { SheetView } from "../../../../../components/sheet/types";
import { elementaSheetViews } from "../../../../sheets/elementa/_";
import { ContextPanelHeader } from "../../../_common/header";
import { activeControlPanelKey } from "../_libs";

const sheets = [
  elementaSheetViews.alignment,
  elementaSheetViews.elementPosition,
  elementaSheetViews.elementBox,
  elementaSheetViews.containerLayout,
  elementaSheetViews.containerText,
  elementaSheetViews.text,
  elementaSheetViews.vector,
  elementaSheetViews.media,
  elementaSheetViews.componentElementProps,
  elementaSheetViews.componentElementStylesheets,
  elementaSheetViews.array,
  elementaSheetViews.elementStyle,
  elementaSheetViews.elementTransitions,
  elementaSheetViews.elementAnimations,
  elementaSheetViews.elementEffects,
] as SheetView[];

export function AnimationPropertiesPanel({
  selection,
  stateKey,
}: {
  selection: ElementHandle[];
  stateKey: string[];
}): JSX.Element {
  return (
    <>
      <ContextPanelHeader
        title="Animation"
        icon={elllIcons16.appearances}
        onBack={() => {
          selection.forEach((h) =>
            h.entity.setEditorState(activeControlPanelKey, undefined),
          );
        }}
      />
    </>
  );
}
