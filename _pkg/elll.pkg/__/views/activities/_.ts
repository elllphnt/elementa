import { View } from "@repo/shell";
import { AssetsActivityView } from "./assets_activity";
import { DesignActivityView } from "./design_activity";
import { WorkspaceActivityView } from "./project_activity";

export const activityPanelViews = {
  workspace: {
    id: "elll.view.activity-panel.workspace",
    render: WorkspaceActivityView,
  },
  design: {
    id: "elll.view.activity-panel.design",
    render: DesignActivityView,
  },
  assets: {
    id: "elll.view.activity-panel.assets",
    render: AssetsActivityView,
  },
} satisfies Record<string, View>;
