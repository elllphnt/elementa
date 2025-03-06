import { View } from "@repo/shell";
import { keys } from "~/src/libs/keys";
import { CommitView } from "./commit/commit";
import { ProjectSpec } from "./onboarding/build_your_project/build_your_project";
import { NpmPackageBrowser } from "./packages/npm_package_browser";
import { NpmPackageViewer } from "./packages/npm_package_viewer";
import { PackageBrowser } from "./packages/package_browser";
import { DeleteProjectModal } from "./project/delete_project";
import { ProjectInfoModal } from "./project/project";
import { ProjectList } from "./project/project_list";
import { StateView } from "./state/state";
import { StyleSystemModal } from "./style_system/style_system";
import { CreateVersionModal } from "./tag/create_tag";
import { AccountModal } from "./user/account";
import { ExportMenu } from "./workspace/export";

export const modalViews = {
  project: {
    id: "elll.views.modals.project",
    render: ProjectInfoModal,
  },
  projectList: {
    id: "elll.views.modals.project-list",
    render: ProjectList,
  },
  deleteProject: {
    id: "elll.views.modals.delete-project",
    render: DeleteProjectModal,
  },

  // Workspace

  export: {
    id: "elll.views.modals.export",
    render: ExportMenu,
  },

  // User

  account: {
    id: "elll.views.modals.account",
    render: AccountModal,
  },

  // Commit
  commit: {
    id: "elll.views.modals.commit",
    render: CommitView,
  },

  // Tag
  createTag: {
    id: "elll.views.modals.tag",
    render: CreateVersionModal,
  },

  // Packages
  packageBrowser: {
    id: "elll.views.modals.package-browser",
    render: PackageBrowser,
  },
  npmPackageBrowser: {
    id: "elll.views.modals.package-browser.npm",
    render: NpmPackageBrowser,
  },
  npmPackageViewer: {
    id: "elll.views.modals.package-viewer.npm",
    render: NpmPackageViewer,
  },

  // Onboarding

  spec: {
    id: "elll.views.modals.generate-project",
    render: ProjectSpec,
  },

  // Style System
  styleSystem: {
    id: keys.views.modals.styleSystem,
    render: StyleSystemModal,
  },

  // State
  state: {
    id: keys.views.modals.state,
    render: StateView,
  },
} satisfies Record<string, View>;
