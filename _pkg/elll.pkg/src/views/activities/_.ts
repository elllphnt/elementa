import { View } from "@repo/shell";
import { AssetsActivityView } from "./assets_activity";
import { DesignActivityView } from "./design_activity";
import { ProjectActivityView } from "./project_activity";
import { StyleActivityView } from "./style_activity";
import { VersionActivityView } from "./version_activity";
import { WorkspaceActivityView } from "./workspace_activity";
import { ResourcesActivityView } from "./resources_activity";
import { AppActivityView } from "./app_activity";

export const activityPanelViews = {
  workspace: {
    id: "elll.view.activity-panel.workspace",
    render: WorkspaceActivityView,
  },
  design: {
    id: "elll.view.activity-panel.design",
    render: DesignActivityView,
  },
  version: {
    id: "elll.view.activity-panel.version",
    render: VersionActivityView,
  },
  assets: {
    id: "elll.view.activity-panel.assets",
    render: AssetsActivityView,
  },
  style: {
    id: "elll.view.activity-panel.style",
    render: StyleActivityView,
  },
  resources: {
    id: "elll.view.activity-panel.resources",
    render: ResourcesActivityView,
  },
  project: {
    id: "elll.view.activity-panel.project",
    render: ProjectActivityView,
  },
  app: {
    id: "elll.view.activity-panel.app",
    render: AppActivityView,
  },
} satisfies Record<string, View>;
