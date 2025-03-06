import { SheetView } from "../../../../../../../components/sheet/types";
import { ElementAppearanceSheet } from "./appearance";
import { ElementEffectsAppearanceSheet } from "./effects";
import { ElementStyleAppearanceSheet } from "./style";
import { ElementTransformAppearanceSheet } from "./transform";
import { ElementTextAppearanceSheet } from "./text";

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
  effects: {
    id: "elementa.sheets.appearances.effects",
    title: "Effects",
    render: ElementEffectsAppearanceSheet,
  },
  text: {
    id: "elementa.sheets.appearances.text",
    title: "Text",
    render: ElementTextAppearanceSheet,
  },
} satisfies Record<string, SheetView<{ appearances: Appearance[] }>>;
