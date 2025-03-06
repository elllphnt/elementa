import { View } from "@repo/components";
import { FramePresetMenu } from "./frame_preset_menu";

export const framePresetControlViews = {
  menu: {
    id: "controls.frame-preset.menu",
    render: FramePresetMenu,
  },
} satisfies Record<string, View>;
