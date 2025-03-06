import { View } from "~/src/view/_types";
import { ColorControlMenu } from "./menu";

export const colorControlViews = {
  menu: {
    id: "control.color.menu",
    render: ColorControlMenu,
  },
} satisfies Record<string, View>;
