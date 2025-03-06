import { View } from "@repo/components";
import { EffectMenu } from "./effect_menu";

export const effectControlViews = {
  menu: {
    id: "controls.datatypes.effect.menu",
    render: EffectMenu,
  },
} satisfies Record<string, View>;
