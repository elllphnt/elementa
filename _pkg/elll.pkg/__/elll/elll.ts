import { ElllBackend, Tenant, Workspace } from "@repo/backend";
import { Shell } from "@repo/shell";
import { Disposable } from "@repo/utils";
import { createElement } from "react";
import { createRoot } from "react-dom/client";
import {
  BehaviorSubject,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  map,
  Observable,
  of,
  switchMap,
} from "rxjs";
import { ContentManager } from "../libs/content/content_manager";
import { EditorManager } from "../libs/editor_manager";
import { ElllProject } from "../libs/project/project";
import Room from "../libs/room";
import { TSVirtualFileSystem } from "../libs/typescript/tsvfs";
import { IElll } from "./_types";
import { Editor } from "./editor";
import { ElllHost } from "./host";
import { Navigation } from "./navigation";
import { registerServiceWorker } from "./service_worker";

const workspaceDefaultSettings = {
  state: {
    activityBar: {
      visible: true,
    },
    activityPanel: {
      visible: true,
    },
    contextPanel: {
      visible: true,
    },
    appBar: {
      visible: true,
    },
  },
};
const emptyWorkspaceSettings = {
  state: {
    activityBar: {
      visible: false,
    },
    activityPanel: {
      visible: false,
    },
    contextPanel: {
      visible: false,
    },
    appBar: {
      visible: true,
    },
  },
  editors: [],
};

export class Elll extends Disposable implements IElll {
  static key = "elll";

  readonly shell: Shell;
  readonly backend: ElllBackend;
  readonly editorManager: EditorManager;
  readonly contentManager: ContentManager;
  readonly tsvfs: TSVirtualFileSystem;
  readonly project: ElllProject;
  readonly navigation = new Navigation<string>();
  readonly host: ElllHost;

  private _room$ = new BehaviorSubject<Room | undefined>(undefined);

  get properties() {
    return this.shell.properties;
  }

  get userId() {
    return this.host.userId;
  }
  get userId$() {
    return this.host.userId$;
  }

  get tenantId() {
    return this.host.tenantId;
  }
  get tenantId$() {
    return this.host.tenantId$;
  }

  get workspaceId() {
    return this.host.workspaceId;
  }
  get workspaceId$() {
    return this.host.workspaceId$;
  }

  get tenant() {
    return this.tenantId
      ? this.backend.instance<Tenant>(this.tenantId, true)
      : undefined;
  }
  get tenant$() {
    return this.tenantId$.pipe(
      map((tenantId) => {
        return tenantId
          ? this.backend.instance<Tenant>(tenantId, true)
          : undefined;
      }),
    );
  }

  get workspace() {
    return this.workspaceId
      ? this.backend.instance<Workspace>(this.workspaceId, true)
      : undefined;
  }
  get workspace$() {
    return this.workspaceId$.pipe(
      map((workspaceId) => {
        return workspaceId
          ? this.backend.instance<Workspace>(workspaceId, true)
          : undefined;
      }),
    );
  }

  get room() {
    return this._room$.value;
  }
  get room$() {
    return this._room$.asObservable();
  }

  fileAtPathQuery(
    path: string,
    create?: {
      type: string;
    },
  ) {
    return this.workspace?.fileAtPath(path, {
      autoFetch: true,
      create,
    });
  }
  fileAtPathQuery$(
    path: string,
    create?: {
      type: string;
    },
  ) {
    return this.workspace$.pipe(
      map((workspace) => {
        return workspace?.fileAtPath(path, {
          autoFetch: true,
          create,
        });
      }),
    );
  }

  fileAtPath(
    path: string,
    create?: {
      type: string;
    },
  ): any {
    return this.fileAtPathQuery(path, create)?.data;
  }
  fileAtPath$(
    path: string,
    create?: {
      type: string;
    },
  ): Observable<any> {
    return this.fileAtPathQuery$(path, create)?.pipe(
      switchMap((query) => query?.data$ ?? of(undefined)),
    );
  }

  constructor({ backend, host }: { backend: ElllBackend; host: ElllHost }) {
    super();
    this.host = host;
    this.shell = new Shell();
    this.backend = backend;
    this.editorManager = new EditorManager({ elll: this });
    this.contentManager = new ContentManager({ elll: this });
    this.tsvfs = new TSVirtualFileSystem({ elll: this });
    this.project = new ElllProject({ elll: this });

    this.shell.properties.set(Elll.key, this);

    // load settings when user or workspace changes
    const settingsSubscription = combineLatest([
      this.userId$.pipe(distinctUntilChanged()),
      this.workspaceId$.pipe(distinctUntilChanged()),
    ]).subscribe(([userId, workspaceId]) => {
      this.loadWorkspaceSettings({ userId, workspaceId });
    });

    // save settings when workspace state changes
    const workspaceSubscription = this.shell.workspace$
      .pipe(
        switchMap((workspace) => workspace.data$),
        debounceTime(1000),
      )
      .subscribe((state) => {
        this.saveWorkspaceSettings({
          userId: this.userId,
          workspaceId: this.workspaceId,
          value: state,
        });
      });

    // initialize new room when workspace changes
    const roomSubscription = combineLatest([
      this.workspaceId$,
      this.userId$,
    ]).subscribe(([workspaceId, userId]) => {
      const current = this.room;
      if (workspaceId && userId) {
        const apiBaseUrl = new URL(
          this.backend.getProperty("elllephantApiBaseUrl"),
        );
        const url = new URL(`/rooms`, apiBaseUrl.origin).toString();
        const next = new Room({
          url: url.toString(),
          userId,
          workspaceId,
          getToken: () => {
            const tokenManager = this.backend.getProperty(
              "elllephantApiTokenManager",
            );
            return tokenManager.getToken();
          },
        });
        this._room$.next(next);
      }
      if (current) {
        current.dispose();
      }
    });

    this.addDisposer(() => {
      settingsSubscription.unsubscribe();
      workspaceSubscription.unsubscribe();
      roomSubscription.unsubscribe();
    });
  }

  async init() {
    await this.tsvfs.init();
    await registerServiceWorker();
  }

  private _currentLoadedWorkspaceId: string | undefined;
  async loadWorkspaceSettings({
    userId,
    workspaceId,
  }: {
    userId: string | undefined;
    workspaceId: string | undefined;
  }) {
    if (!userId || !workspaceId) {
      this.shell.workspace.restore(emptyWorkspaceSettings);
      this._currentLoadedWorkspaceId = undefined;
      return;
    }

    // const settingData = await this.backend.identityService.fetchSetting({
    //   owner: userId,
    //   key: workspaceSettingKey(workspaceId),
    // });
    const settings = workspaceDefaultSettings; // settingData?.value ?? workspaceDefaultSettings;
    this.shell.workspace.restore({
      ...settings,
      state: {
        ...settings.state,
        activityBar: {
          visible: true,
        },
        appBar: {
          visible: true,
        },
      },
    } as any);
    this._currentLoadedWorkspaceId = `${workspaceId}-${userId}`;
  }
  async saveWorkspaceSettings({
    userId,
    workspaceId,
    value,
  }: {
    userId: string | undefined;
    workspaceId: string | undefined;
    value: any;
  }) {
    if (!userId || !workspaceId) {
      return;
    }
    if (this._currentLoadedWorkspaceId !== `${workspaceId}-${userId}`) {
      return;
    }

    // await this.backend.identityService.saveSetting({
    //   owner: userId,
    //   key: workspaceSettingKey(workspaceId),
    //   value,
    // });
  }

  render(dom: HTMLElement) {
    const root = createRoot(dom);
    root.render(
      createElement(Editor, {
        elll: this,
      }),
    );
  }

  async generateWorkspace({ query }: { query: string }) {
    const workspace = await this.tenant?.createWorkspace({
      name: query.slice(0, 20),
    });
    if (!workspace) {
      return;
    }
    this.host.openWorkspace(workspace.id);

    const thread = await workspace.createIntelligenceThread();
    if (!thread) {
      return;
    }

    this.shell.workspace.state.set("activeThreadId", thread.id);
    thread?.postMessage({ content: query });
  }
}
