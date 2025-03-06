import { Appearance } from "@repo/elementa";
import { SheetView } from "../../../../../../../components/sheet/types";
import { ElementAppearanceSheet } from "./appearance";
import { ElementStyleAppearanceSheet } from "./style";
import { ElementTransformAppearanceSheet } from "./transform";

export const elementAppearancesSheets = {
  appearance: {
    id: "elementa.sheets.appearance",
    title: "Appearance",
    render: ElementAppearanceSheet,
  },
  transform: {
    id: "elementa.sheets.transform",
    title: "Transform",
    render: ElementTransformAppearanceSheet,
  },
  style: {
    id: "elementa.sheets.appearances.style",
    title: "Style",
    render: ElementStyleAppearanceSheet,
  },
} satisfies Record<string, SheetView<{ appearances: Appearance[] }>>;
