import { elllIcons20 } from "@repo/components";
import { Activity } from "@repo/shell";
import { activityPanelViews } from "../views/activities/_";

export const designActivity: Activity = {
  id: "elll.activity.design",
  type: "primary",
  name: "Design",
  icon: elllIcons20.activityDesign,
  panel: {
    viewId: activityPanelViews.design.id,
  },
  priority: 100,
};
