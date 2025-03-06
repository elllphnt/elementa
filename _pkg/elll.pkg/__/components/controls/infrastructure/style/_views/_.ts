import { View } from "@repo/components";
import { StylePropertyView } from "./style_property";

export const styleControlViews = {
  menu: {
    id: "controls.style.menu",
    render: StylePropertyView,
  },
} satisfies Record<string, View>;
