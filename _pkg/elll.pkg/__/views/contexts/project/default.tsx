import { Handle } from "@repo/elementa";
import SheetContainer from "../../../components/sheet/sheet_container";
import { projectSheets } from "../../sheets/elementa/project/_";

export const frameSheets = [projectSheets.styles, projectSheets.themes];

export function ProjectDefaultContextPanel({
  selection,
  stateKey,
}: {
  selection: Handle[];
  stateKey: string[];
}): JSX.Element {
  return (
    <SheetContainer
      key={selection.map((s) => s.key).join(",")}
      sheets={frameSheets.map((sheet) => ({
        key: sheet.id,
        viewId: sheet.id,
        title: sheet.title,
      }))}
      stateKey={[...stateKey, "sheets"]}
      props={{}}
    />
  );
}
