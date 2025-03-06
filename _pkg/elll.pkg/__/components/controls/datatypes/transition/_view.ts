import { View } from "@repo/components";
import { TransitionBrowser } from "./transition_browser";
import { TransitionMenu } from "./transition_menu";

export const transitionControlViews = {
  menu: {
    id: "controls.datatypes.transition.menu",
    render: TransitionMenu,
  },
  browser: {
    id: "controls.datatypes.transition.browser",
    render: TransitionBrowser,
  },
} satisfies Record<string, View>;
