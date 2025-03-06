import { View } from "@repo/shell";
import { PropsOutline } from "./elementa/props";
import { RoutinesOutline } from "./elementa/routines";
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
  elementaRoutines: {
    id: "elementa.outline.routines",
    render: RoutinesOutline,
  },
  elementaView: {
    id: "elementa.outline.view",
    render: ViewOutline,
  },
  elementaStylesheets: {
    id: "elementa.outline.stylesheets",
    render: StylesheetsOutline,
  },
} satisfies Record<string, View>;
