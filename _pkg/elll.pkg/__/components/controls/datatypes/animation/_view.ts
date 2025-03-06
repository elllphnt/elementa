import { View } from "@repo/components";
import { AnimationBrowser } from "./animation_browser";
import { AnimationMenu } from "./animation_menu";
import { StyleAnimationMenu } from "./style_animation_menu";

export const animationControlViews = {
  menu: {
    id: "controls.datatypes.animation.menu",
    render: AnimationMenu,
  },
  styleMenu: {
    id: "controls.datatypes.animation.style-menu",
    render: StyleAnimationMenu,
  },
  browser: {
    id: "controls.datatypes.animation.browser",
    render: AnimationBrowser,
  },
} satisfies Record<string, View>;
