import { ElementHandle } from "@repo/elementa-interactor";
import SheetContainer from "~/src/components/sheet/sheet_container";
import { SheetView } from "~/src/components/sheet/types";
import { elementaSheetViews } from "../../sheets/_";

const sheets = [
  elementaSheetViews.elementRepeat,
  elementaSheetViews.componentElementProps,
] as SheetView[];

export function ElementPropertiesPanel({
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
