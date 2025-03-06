import { elllIcons20 } from "@repo/components";
import { Activity } from "@repo/shell";
import { activityPanelViews } from "../views/activities/_";

export const workspaceActivity: Activity = {
  id: "elll.activity.workspace",
  type: "secondary",
  name: "Workspace",
  icon: elllIcons20.workspace,
  panel: {
    viewId: activityPanelViews.workspace.id,
  },
};
