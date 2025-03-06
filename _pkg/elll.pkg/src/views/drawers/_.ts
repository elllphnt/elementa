import { View } from "@repo/shell";
import { keys } from "~/src/libs/keys";
import { ChangesView } from "./changes/changes";
import { CommitsView } from "./commits/commits";
import { DangerView } from "./danger/danger";
import { FilesView } from "./files/files";
import { LibrariesView } from "./libraries/libraries";
import { OutlineView } from "./outline/outline";
import { PackagesView } from "./packages/packages";
import { ProjectView } from "./project/project";
import { ServicesView } from "./services/services";
import { StyleAssetsView } from "./style_assets/style_assets";
import { StyleSystemView } from "./style_system/style_system";
import { StyleUtilitiesView } from "./style_utilities/style_utilities";
import { TagsView } from "./tags/tags";
import { ThemesView } from "./themes/themes";

export const drawerViews = {
  files: {
    id: "elll.views.drawers.files",
    render: FilesView,
  },
  workspace: {
    id: "elll.views.drawers.workspace",
    render: DangerView,
  },
  project: {
    id: "elll.views.drawers.project",
    render: ProjectView,
  },
  services: {
    id: "elll.views.drawers.services",
    render: ServicesView,
  },
  outline: {
    id: "elll.views.drawers.outline",
    render: OutlineView,
  },
  changes: {
    id: "elll.views.drawers.changes",
    render: ChangesView,
  },
  commits: {
    id: "elll.views.drawers.commits",
    render: CommitsView,
  },
  tags: {
    id: "elll.views.drawers.tags",
    render: TagsView,
  },
  packages: {
    id: "elll.views.drawers.packages",
    render: PackagesView,
  },
  libraries: {
    id: "elll.views.drawers.libraries",
    render: LibrariesView,
  },
  themes: {
    id: "elll.views.drawers.themes",
    render: ThemesView,
  },
  style_system: {
    id: keys.views.drawers.style_system,
    render: StyleSystemView,
  },
  style_assets: {
    id: keys.views.drawers.style_assets,
    render: StyleAssetsView,
  },
  style_utilities: {
    id: keys.views.drawers.style_utilities,
    render: StyleUtilitiesView,
  },
  danger: {
    id: "elll.views.drawers.danger",
    render: DangerView,
  },
} satisfies Record<string, View>;
