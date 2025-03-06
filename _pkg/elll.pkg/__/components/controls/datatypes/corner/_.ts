import { View } from "@repo/components";
import { CornerControlMenu } from "./corner_menu";

export const cornerControlViews = {
  menu: {
    id: "elll.views.controls.corner.menu",
    render: CornerControlMenu,
  },
} satisfies Record<string, View>;
