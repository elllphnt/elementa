import { elllIcons16, elllIcons20 } from "@repo/components";
import { Activity, Context, Workspace, WorkspaceLayout } from "@repo/shell";
import { filter, first, map, of, switchMap } from "rxjs";
import { keys } from "../libs/keys";
import { IElll } from "../types/elll";
import { activityPanelViews } from "../views/activities/_";
import { appBarViews } from "../views/app_bar/_";

// activities

const designActivity: Activity = {
  id: "elll.activity.design",
  type: "primary",
  name: "Design",
  icon: elllIcons20.activityDesign,
  panel: {
    viewId: activityPanelViews.design.id,
  },
  priority: 100,
};
const assetsActivity: Activity = {
  id: "elll.activity.assets",
  type: "primary",
  name: "Assets",
  icon: elllIcons20.activityAssets,
  panel: {
    viewId: activityPanelViews.assets.id,
  },
  priority: 90,
};
const styleActivity: Activity = {
  id: "elll.activity.style",
  type: "primary",
  name: "Style",
  icon: elllIcons20.activityStyle,
  panel: {
    viewId: activityPanelViews.style.id,
  },
  priority: 80,
};
const resourcesActivity: Activity = {
  id: "elll.activity.resources",
  type: "primary",
  name: "Resources",
  icon: elllIcons20.activityAssets,
  panel: {
    viewId: activityPanelViews.resources.id,
  },
  priority: 70,
};
const versionControlActivity: Activity = {
  id: "elll.activity.version-control",
  type: "primary",
  name: "Version Control",
  icon: elllIcons20.versionActivity,
  panel: {
    viewId: activityPanelViews.version.id,
  },
  priority: 60,
};

const projectActivity: Activity = {
  id: "elll.activity.project",
  type: "secondary",
  name: "Project",
  icon: elllIcons20.projectActivity,
  panel: {
    viewId: activityPanelViews.project.id,
  },
  priority: 80,
};

// contexts

const copilotContext: Context = {
  id: "elll.context.copilot",
  name: "Copilot",
  icon: elllIcons16.ai,
  panel: {
    viewId: keys.views.copilot,
  },
};

const stateConfigurationKey = (repositoryId: string) =>
  `elll.repository.${repositoryId}.state`;

export class RepositoryWorkspace extends Workspace {
  readonly repositoryId: string;
  readonly elll: IElll;

  get contexts() {
    return [];
  }
  get contexts$() {
    return of([]);
  }

  get layout(): WorkspaceLayout {
    return {
      appBar: true,
      activityBar: true,
      activityPanel: true,
      contextPanel: true,
      statusBar: true,
    };
  }
  get viewMap() {
    return {
      appBar: appBarViews.default.id,
    };
  }

  get stateConfigurationQuery() {
    const user = this.elll.user;
    if (!user) {
      return undefined;
    }
    return user.configuration(stateConfigurationKey(this.repositoryId));
  }
  get stateConfigurationQuery$() {
    return this.elll.user$.pipe(
      map((user) => {
        if (!user) {
          return undefined;
        }
        return user.configuration(stateConfigurationKey(this.repositoryId));
      }),
    );
  }
  get stateConfiguration() {
    return this.stateConfigurationQuery?.data;
  }
  get stateConfiguration$() {
    return this.stateConfigurationQuery$.pipe(
      switchMap((query) => query?.data$ ?? of(undefined)),
    );
  }

  constructor({ repositoryId, elll }: { repositoryId: string; elll: IElll }) {
    super({ shell: elll.shell });
    this.repositoryId = repositoryId;
    this.elll = elll;

    this.loadActivities(
      designActivity,
      styleActivity,
      resourcesActivity,
      versionControlActivity,
      projectActivity,
    );

    if (this.stateConfiguration?.loaded) {
      this.initState();
    } else {
      this.stateConfiguration$
        .pipe(
          switchMap((config) => config?.loaded$ ?? of(false)),
          filter((loaded) => loaded),
          first(),
        )
        .subscribe(() => {
          this.initState();
        });
    }
  }

  initState() {
    // load state once configuration is loaded
    const state = {
      ...this.stateConfiguration?.data,
      state: {
        activeActivityId: designActivity.id,
        activityPanel: { visible: true },
        contextPanel: { visible: true },
        ...this.stateConfiguration?.data?.state,
      },
    };
    try {
      this.restore(state);
    } catch (e) {
      console.error(e);
    }
    this.initialize();

    // watch for changes to state and save them
    this.data$.subscribe((state) => {
      this.stateConfiguration?.setData(state);
    });
  }
}
