import { Handle } from "@repo/elementa";
import SheetContainer from "../../../components/sheet/sheet_container";
import { SheetView } from "../../../components/sheet/types";
import { elementaInteractionSheets } from "../../sheets/elementa/interactions/_";

export function InteractionsPanel({
  selection,
  stateKey,
}: {
  selection: Handle[];
  stateKey: string[];
}): JSX.Element {
  return (
    <SheetContainer
      sheets={Object.values(elementaInteractionSheets)
        .sort(
          (a, b) =>
            ((a as SheetView).order || 0) - ((b as SheetView).order || 0),
        )
        .map((sheet) => ({
          key: sheet.id,
          viewId: sheet.id,
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
