import { elllIcons20 } from "@repo/components";
import { Activity } from "@repo/shell";
import { activityPanelViews } from "../views/activities/_";

export const assetsActivity: Activity = {
  id: "elll.activity.assets",
  type: "primary",
  name: "Assets",
  icon: elllIcons20.activityAssets,
  panel: {
    viewId: activityPanelViews.assets.id,
  },
  priority: 80,
};
