import { Handle, Instance } from "@repo/elementa";
import { SheetView } from "../../../../../components/sheet/types";
import { ProjectRootStyleBodySheet } from "./body";
import { FrameTextControlSheet } from "./text";

export const projectRootStyleSheets = {
  text: {
    id: "elementa.sheet.project.root-style.text",
    title: "Text",
    render: FrameTextControlSheet,
  },
  body: {
    id: "elementa.sheet.project.root-style.body",
    title: "Body",
    render: ProjectRootStyleBodySheet,
  },
} satisfies Record<
  string,
  SheetView<{
    instances: Instance[];
    selection: Handle[];
  }>
>;
