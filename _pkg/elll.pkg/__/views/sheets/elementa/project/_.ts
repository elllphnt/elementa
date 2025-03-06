import { Handle, Instance } from "@repo/elementa";
import { SheetView } from "../../../../components/sheet/types";
import { ProjectStylesSheet } from "./styles";
import { projectRootStyleSheets } from "./root_style/_";
import { ProjectThemesSheet } from "./themes";

export const projectSheets = {
  styles: {
    id: "elementa.sheet.project.styles",
    title: "Styles",
    render: ProjectStylesSheet,
  },
  themes: {
    id: "elementa.sheet.project.themes",
    title: "Themes",
    render: ProjectThemesSheet,
  },

  ...Object.fromEntries(
    Object.entries(projectRootStyleSheets).map(([key, sheet]) => [
      "root-style:" + key,
      sheet,
    ]),
  ),
} satisfies Record<
  string,
  SheetView<{
    instances: Instance[];
    selection: Handle[];
  }>
>;
