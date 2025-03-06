import { ElementHandle } from "@repo/elementa";
import SheetContainer from "../../../../../components/sheet/sheet_container";
import { SheetView } from "../../../../../components/sheet/types";
import { elementaSheetViews } from "../../../../sheets/elementa/_";

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

export function ElementGeneralPropertiesPanel({
  selection,
  stateKey,
}: {
  selection: ElementHandle[];
  stateKey: string[];
}): JSX.Element {
  return (
    <SheetContainer
      key={selection.map((s) => s.key).join(",")}
      sheets={sheets.map((sheet) => ({
        key: sheet.id,
        viewId: sheet.id,
        title: sheet.title,
      }))}
      stateKey={[...stateKey, "sheets"]}
      props={{
        selection,
        renderables: selection.map((handle) => handle.renderable),
        instances: selection.map((handle) => handle.renderable.instance),
      }}
    />
  );
}
