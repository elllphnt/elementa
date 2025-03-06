import { View } from "@repo/shell";
import { PropsOutline } from "./elementa/props";
import { StatesOutline } from "./elementa/states";
import { ViewOutline } from "./elementa/view/view";
import { ElementaEditorOutlineView } from "./elementa/elementa";

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
  componentEditor: {
    id: "elementa.outline",
    render: ElementaEditorOutlineView,
  },
} satisfies Record<string, View>;
