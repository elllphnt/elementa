import { View } from "@repo/shell";
import { AssetsView } from "./assets/assets";
import { DangerView } from "./danger/danger";
import { FilesView } from "./files/files";
import { OutlineView } from "./outline/outline";
import { PackagesView } from "./packages/packages";
import { SourceView } from "./source/source";
import { ThemesView } from "./themes/themes";
import { WorkspaceView } from "./workspace/workspace";

export const drawerViews = {
  assets: {
    id: "elll.views.drawers.assets",
    render: AssetsView,
  },
  outline: {
    id: "elll.views.drawers.outline",
    render: OutlineView,
  },
  packages: {
    id: "elll.views.drawers.packages",
    render: PackagesView,
  },
  source: {
    id: "elll.views.drawers.source",
    render: SourceView,
  },
  files: {
    id: "elll.views.drawers.files",
    render: FilesView,
  },
  danger: {
    id: "elll.views.drawers.danger",
    render: DangerView,
  },
  workspace: {
    id: "elll.views.drawers.workspace",
    render: WorkspaceView,
  },
  themes: {
    id: "elll.views.drawers.themes",
    render: ThemesView,
  },
} satisfies Record<string, View>;
