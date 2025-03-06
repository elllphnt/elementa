import { View } from "@repo/components";
import { PropMenu } from "./prop_menu";

export const propControlViews = {
  menu: {
    id: "controls.assets.props.menu",
    render: PropMenu,
  },
} satisfies Record<string, View>;
