import { FrameWidgetHandle } from "@repo/elementa-interactor";
import SheetContainer from "~/src/components/ui/sheets/sheet_container";
import { SheetView } from "~/src/components/ui/sheets/types";
import { elementaSheetViews } from "../../sheets/_";

const sheets = [
  elementaSheetViews.alignment,
  elementaSheetViews.frame,
  elementaSheetViews.frameViewport,
  elementaSheetViews.frameStyle,
] as SheetView[];

export function FramePropertiesPanel({
  selection,
  stateKey,
}: {
  selection: FrameWidgetHandle[];
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
