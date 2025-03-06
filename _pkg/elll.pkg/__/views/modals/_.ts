import { View } from "@repo/shell";
import { ChatHistoryView } from "./copilot/chat_history";
import { ComponentPropView } from "./elementa/component_prop";
import { EvaluableMenu } from "./elementa/evaluable";
import { KeyframeSetEditor } from "./keyframes/keyframe_set_editor";
import { LibraryBrowser } from "./libraries/library_browser";
import { LibraryViewer } from "./libraries/library_viewer";
import { NpmPackageBrowser } from "./packages/npm_package_browser";
import { NpmPackageViewer } from "./packages/npm_package_viewer";
import { PackageBrowser } from "./packages/package_browser";
import { StylesheetBrowser } from "./stylesheets/stylesheet_browser";
import { StylesheetEditor } from "./stylesheets/stylesheet_editor";
import { ThemeSettingsView } from "./themes/settings";
import { ThemeView } from "./themes/theme";
import { ThemeValuesView } from "./themes/values";
import { AccountModal } from "./user/account";
import { ProjectVariablesView } from "./variables/variables";
import { CreateFileView } from "./workspace/create_file";
import { DeleteWorkspaceModal } from "./workspace/delete_workspace";
import { ExportMenu } from "./workspace/export/export";
import { WorkspaceInfoModal } from "./workspace/workspace";

export const modalViews = {
  // Theme

  theme: {
    id: "elll.views.modals.theme",
    render: ThemeView,
  },
  themeValues: {
    id: "elll.views.modals.theme.values",
    render: ThemeValuesView,
  },
  themeSettings: {
    id: "elll.views.modals.theme.settings",
    render: ThemeSettingsView,
  },

  // Variables

  variables: {
    id: "elll.views.modals.variables",
    render: ProjectVariablesView,
  },

  // Workspace

  workspaceInfo: {
    id: "elll.views.modals.workspace",
    render: WorkspaceInfoModal,
  },
  deleteWorkspace: {
    id: "elll.views.modals.delete-workspace",
    render: DeleteWorkspaceModal,
  },
  export: {
    id: "elll.views.modals.export",
    render: ExportMenu,
  },

  // User

  account: {
    id: "elll.views.modals.account",
    render: AccountModal,
  },

  // Workspace

  createFile: {
    id: "elll.views.modals.create-file",
    render: CreateFileView,
  },

  // Elementa

  evaluable: {
    id: "elll.menu.evaluable",
    render: EvaluableMenu,
  },
  vector: {
    id: "elll.menu.vector",
    render: () => "view", //  render: VectorMenu,
    preferredWidth: 300,
  },
  resource: {
    id: "elll.menu.resource",
    render: () => "view", //  render: ResourceMenu,
  },
  componentProps: {
    id: "elll.menu.component-prop",
    render: ComponentPropView,
  },
  padding: {
    id: "elll.elementa.style.padding",
    render: () => "view", //   render: ElementPaddingControl,
  },

  // Packages

  packageBrowser: {
    id: "elll.package.browser",
    render: PackageBrowser,
    preferredWidth: 500,
  },
  npmPackageBrowser: {
    id: "elll.package.npm-browser",
    render: NpmPackageBrowser,
  },
  npmPackageViewer: {
    id: "elll.package.npm-viewer",
    render: NpmPackageViewer,
  },

  // Libraries

  libraryBrowser: {
    id: "elll.library.browser",
    render: LibraryBrowser,
    preferredWidth: 500,
    preferredHeight: 500,
  },
  libraryViewer: {
    id: "elll.library.viewer",
    render: LibraryViewer,
    preferredWidth: 500,
    preferredHeight: 500,
  },

  // stylesheets

  stylesheetBrowser: {
    id: "elll.views.modals.stylesheet-browser",
    render: StylesheetBrowser,
  },
  stylesheetEditor: {
    id: "elll.views.modals.stylesheet-editor",
    render: StylesheetEditor,
  },

  // copilot

  chatHistory: {
    id: "elll.views.modals.chat-history",
    render: ChatHistoryView,
  },

  // keyframes

  keyFrameSetEditor: {
    id: "elll.views.modals.keyframe-set-editor",
    render: KeyframeSetEditor,
  },
} satisfies Record<string, View>;
