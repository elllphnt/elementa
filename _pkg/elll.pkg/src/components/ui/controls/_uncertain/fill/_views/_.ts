import { View } from "@repo/components";
import { FillMenu } from "./fill_menu";

export const fillControlViews = {
  menu: {
    id: "controls.fill.menu",
    render: FillMenu,
  },
} satisfies Record<string, View>;
