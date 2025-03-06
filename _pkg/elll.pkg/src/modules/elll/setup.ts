import { TokenManager } from "@elllphnt/elll-client";
import {
  baseControlViews,
  elllIcons16Data,
  elllIcons20Data,
} from "@repo/components";
import { controlViews } from "~/src/components/controls/_views";
import { ElllView } from "~/src/components/elll/elll";
import { blueprintEditor } from "~/src/editors/blueprint";
import { componentEditor } from "~/src/editors/elementa/editor";
import { componentViewer } from "~/src/editors/elementa/viewer";
import { jsonEditor } from "~/src/editors/monaco/json";
import { reactEditor } from "~/src/editors/monaco/react";
import { programmingInterfaceEditor } from "~/src/editors/programming_interface";
import { specEditor } from "~/src/editors/spec";
import { utilitySheetEditor } from "~/src/editors/utility_sheet";
import { variableSheetEditor } from "~/src/editors/variable_sheet";
import { configs } from "~/src/libs/configs";
import { setupMonaco } from "~/src/libs/monaco";
import { componentModelConstructor } from "~/src/models/component";
import { jsonModelConstructor } from "~/src/models/json";
import { reactModelConstructor } from "~/src/models/react";
import { activityPanelViews } from "~/src/views/activities/_";
import { appBarViews } from "~/src/views/app_bar/_";
import { boardViews } from "~/src/views/board/_";
import { contextViews } from "~/src/views/contexts/_";
import { drawerViews } from "~/src/views/drawers/_";
import { modalViews } from "~/src/views/modals/_";
import { outlineViews } from "~/src/views/outlines/_";
import { elementaSheetViews } from "~/src/views/sheets/_";
import { HomeWorkspace } from "~/src/workspaces/home";
import { ElllHost } from "../../types/host";
import { Elll } from "./elll";
import { RepositoryHistory } from "./history";

export type ElllConfig = {
  host: ElllHost;
  services: {
    elllephant: {
      url: string;
      tokenManager: TokenManager;
    };
    room: {
      url: string;
      tokenManager: TokenManager;
    };
    elementa: {
      editorUrl: string;
      viewerUrl: string;
    };
  };
};

export function createElllInstance(config: ElllConfig) {
  const host = config.host;
  const view = ElllView;
  const elll = new Elll({
    host,
    view,
    services: config.services,
  });

  // models
  elll.modelManager.registerModelConstructor(jsonModelConstructor);
  elll.modelManager.registerModelConstructor(componentModelConstructor);
  elll.modelManager.registerModelConstructor(reactModelConstructor);

  // configs
  elll.setConfig(configs.elll.history, new RepositoryHistory({ elll }));

  // shell resources
  const shell = elll.shell;
  shell.viewStore.loadViews(...Object.values(boardViews));
  shell.viewStore.loadViews(...Object.values(activityPanelViews));
  shell.viewStore.loadViews(...Object.values(appBarViews));
  shell.viewStore.loadViews(...Object.values(modalViews));
  shell.viewStore.loadViews(...Object.values(drawerViews));
  shell.viewStore.loadViews(...Object.values(contextViews));
  shell.viewStore.loadViews(...Object.values(outlineViews));
  shell.viewStore.loadViews(...Object.values(controlViews));
  shell.viewStore.loadViews(...Object.values(elementaSheetViews));
  shell.viewStore.loadViews(...Object.values(baseControlViews));

  shell.iconStore.loadIcons(...Object.values(elllIcons20Data));
  shell.iconStore.loadIcons(...Object.values(elllIcons16Data));

  shell.loadEditors(
    jsonEditor,
    componentEditor,
    reactEditor,
    componentViewer,
    specEditor,
    blueprintEditor,
    programmingInterfaceEditor,
    variableSheetEditor,
    utilitySheetEditor,
  );

  // load home workspace
  const homeWorkspace = new HomeWorkspace({ shell });
  shell.loadWorkspace(homeWorkspace);

  // monaco editor instance
  setupMonaco(elll);

  return elll;
}
