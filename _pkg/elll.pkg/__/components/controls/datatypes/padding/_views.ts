import { View } from "@repo/components";
import { PaddingControlMenu } from "./padding_menu";

export const paddingControlViews = {
  menu: {
    id: "controls.datatypes.padding.menu",
    render: PaddingControlMenu,
  },
} satisfies Record<string, View>;
