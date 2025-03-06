import { View } from "@repo/components";
import { BorderMenu } from "./border_menu";

export const borderControlViews = {
  menu: {
    id: "controls.datatypes.border.menu",
    render: BorderMenu,
  },
} satisfies Record<string, View>;
