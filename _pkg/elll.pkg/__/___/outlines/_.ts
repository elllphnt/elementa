import { View } from "@repo/shell";
import { ElementaEditorOutlineView } from "./elementa/elementa";
import { PropsOutline } from "./elementa/props";
import { StatesOutline } from "./elementa/states";
import { StylesheetsOutline } from "./elementa/stylesheets";
import { ViewOutline } from "./elementa/view/view";

export const outlineViews = {
  elementaProps: {
    id: "elementa.outline.props",
    render: PropsOutline,
  },
  elementaState: {
    id: "elementa.outline.state",
    render: StatesOutline,
  },
  elementaView: {
    id: "elementa.outline.view",
    render: ViewOutline,
  },
  elementaStylesheets: {
    id: "elementa.outline.stylesheets",
    render: StylesheetsOutline,
  },
  componentEditor: {
    id: "elementa.outline",
    render: ElementaEditorOutlineView,
  },
} satisfies Record<string, View>;
