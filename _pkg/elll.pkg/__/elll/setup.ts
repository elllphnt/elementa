import { TokenManager } from "@elllphnt/elll-client";
import { ElllBackend } from "@repo/backend";
import {
  baseControlViews,
  elllIcons16Data,
  elllIcons20Data,
} from "@repo/components";
import { assetsActivity } from "../activities/assets";
import { designActivity } from "../activities/design";
import { workspaceActivity } from "../activities/workspace";
import { controlViews } from "../components/controls/_views";
import { codeEditor } from "../editors/code/code";
import { componentEditor } from "../editors/component/editor";
import { activityPanelViews } from "../views/activities/_";
import { contextViews } from "../views/contexts/_";
import { drawerViews } from "../views/drawers/_";
import { editorViews } from "../views/editors/_";
import { modalViews } from "../views/modals/_";
import { outlineViews } from "../views/outlines/_";
import { elementaSheetViews } from "../views/sheets/elementa/_";
import { elementaInteractionSheets } from "../views/sheets/elementa/interactions/_";
import { shellViews } from "../views/shell/_";
import { Elll } from "./elll";
import { ElllHost } from "./host";
import { elllPropertyKeys } from "./property_keys";

export type ElllServerConfig = {
  ipAddress: string;
  cnameTarget: string;
  fallbackDomain?: string;
  fallbackProtocol?: string;
};
export type ElllBackendConfig = {
  elllephantApiBaseUrl: string;
  elllephantApiTokenManager: TokenManager;
};
export type ElementaConfig = {
  url: string;
};

export function createElllInstance({
  backendConfig,
  elllServerConfig,
  elementaConfig,
  host,
}: {
  backendConfig: ElllBackendConfig;
  elllServerConfig: ElllServerConfig;
  elementaConfig: ElementaConfig;
  host: ElllHost;
}) {
  const elll = new Elll({
    backend: new ElllBackend(backendConfig),
    host,
  });
  const shell = elll.shell;

  elll.properties.set(elllPropertyKeys.elllServerConfig, elllServerConfig);
  elll.properties.set(elllPropertyKeys.elementaConfig, elementaConfig);

  shell.loadActivities(designActivity, assetsActivity, workspaceActivity);
  shell.viewStore.loadViews(
    ...Object.values(activityPanelViews),
    ...Object.values(drawerViews),
    ...Object.values(modalViews),
    ...Object.values(editorViews),
    ...Object.values(shellViews),
    ...Object.values(contextViews),
    ...Object.values(elementaSheetViews),
    ...Object.values(elementaInteractionSheets),
    ...Object.values(controlViews),
    ...Object.values(baseControlViews),
    ...Object.values(outlineViews),
  );
  shell.loadEditors(componentEditor, codeEditor);
  shell.properties.set(elllPropertyKeys.appBarViewId, shellViews.appbar.id);
  shell.properties.set(
    elllPropertyKeys.boardPlaceholderViewId,
    shellViews.boardPlaceholder.id,
  );
  shell.properties.set(
    elllPropertyKeys.contextPanelPlaceholderViewId,
    shellViews.contextPanelPlaceholder.id,
  );

  shell.iconStore.loadIcons(...Object.values(elllIcons20Data));
  shell.iconStore.loadIcons(...Object.values(elllIcons16Data));

  shell.workspace.state.set("activeActivityId", designActivity.id);

  return elll;
}
