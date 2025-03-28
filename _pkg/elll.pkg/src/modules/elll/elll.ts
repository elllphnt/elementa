import { TokenManager } from "@elllphnt/elll-client";
import { ElllBackend, Repository, Tenant } from "@repo/backend";
import { User } from "@repo/backend/dist/resources/user";
import { Shell } from "@repo/shell";
import { Disposable } from "@repo/utils";
import React, { createElement } from "react";
import { createRoot } from "react-dom/client";
import {
  BehaviorSubject,
  combineLatest,
  distinctUntilChanged,
  map,
  of,
  switchMap,
} from "rxjs";
import { configs } from "~/src/libs/configs";
import { HomeWorkspace } from "~/src/workspaces/home";
import { RepositoryWorkspace } from "~/src/workspaces/repository";
import { IElll } from "../../types/elll";
import { ElllHost } from "../../types/host";
import { ContentManager } from "./content/manager";
import { Copilot } from "./copilot/copilot";
import { EditorManager } from "./editor/manager";
import { ModelManager } from "./model/manager";
import { Room } from "./room/room";

export class Elll extends Disposable implements IElll {
  readonly view: React.ComponentType<{ elll: IElll }>;
  readonly host: ElllHost;
  readonly shell: Shell;
  readonly backend: ElllBackend;
  readonly contentManager: ContentManager;
  readonly modelManager: ModelManager;
  readonly editorManager: EditorManager;
  readonly copilot: Copilot;

  private _configs$ = new BehaviorSubject<Record<string, any>>({});
  private _room$ = new BehaviorSubject<Room | undefined>(undefined);

  get repository() {
    return this.host.repositoryId
      ? this.backend.instance<Repository>(this.host.repositoryId, true)
      : undefined;
  }
  get repository$() {
    return this.host.repositoryId$.pipe(
      map((id) =>
        id ? this.backend.instance<Repository>(id, true) : undefined,
      ),
    );
  }

  get room() {
    return this._room$.value;
  }
  get room$() {
    return this._room$.asObservable();
  }

  get user() {
    return this.host.userId
      ? this.backend.instance<User>(this.host.userId, true)
      : undefined;
  }
  get user$() {
    return this.host.userId$.pipe(
      map((id) => (id ? this.backend.instance<User>(id, true) : undefined)),
    );
  }

  get tenant() {
    return this.host.tenantId
      ? this.backend.instance<Tenant>(this.host.tenantId, true)
      : undefined;
  }
  get tenant$() {
    return this.host.tenantId$.pipe(
      map((id) => (id ? this.backend.instance<Tenant>(id, true) : undefined)),
    );
  }

  config(key: string) {
    return this._configs$.value[key];
  }
  config$(key: string) {
    return this._configs$.pipe(map((configs) => configs[key]));
  }

  constructor({
    host,
    view,
    services,
  }: {
    host: ElllHost;
    view: React.ComponentType<{ elll: IElll }>;
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
  }) {
    super();
    this.setConfig(configs.elementa.editorUrl, services.elementa.editorUrl);
    this.setConfig(configs.elementa.viewerUrl, services.elementa.viewerUrl);
    this.setConfig(configs.elllephant.url, services.elllephant.url);
    this.setConfig(
      configs.elllephant.tokenManager,
      services.elllephant.tokenManager,
    );

    this.view = view;
    this.host = host;
    this.backend = new ElllBackend({
      elllephantApiBaseUrl: services.elllephant.url,
      elllephantApiTokenManager: services.elllephant.tokenManager,
    });
    this.shell = new Shell();
    this.shell.properties.set("elll", this);
    this.contentManager = new ContentManager({ elll: this });
    this.modelManager = new ModelManager({ elll: this });
    this.editorManager = new EditorManager({ elll: this });
    this.copilot = new Copilot({ elll: this });

    // load shell workspace when backend workspace changes
    const workspaceSubscription = this.repository$.subscribe((repository) => {
      if (repository) {
        const shellWorkspace = new RepositoryWorkspace({
          elll: this,
          repositoryId: repository.id,
        });
        this.shell.loadWorkspace(shellWorkspace);
      } else {
        const shellWorkspace = new HomeWorkspace({ shell: this.shell });
        this.shell.loadWorkspace(shellWorkspace);
      }

      // TODO: dispose previous workspace
    });

    // load room when user and workspace are available
    const roomSubscription = combineLatest([
      this.host.userId$.pipe(distinctUntilChanged()),
      this.repository$.pipe(
        switchMap((repository) => repository?.workspaceId$ ?? of(undefined)),
        distinctUntilChanged(),
      ),
    ]).subscribe(([userId, workspaceId]) => {
      if (userId && workspaceId) {
        const room = new Room({
          userId,
          workspaceId,
          url: services.room.url,
          tokenManager: services.room.tokenManager,
        });
        this._room$.next(room);
      } else {
        const room = this._room$.value;
        this._room$.next(undefined);
        room?.dispose();
      }
    });

    this.addDisposer(() => {
      workspaceSubscription.unsubscribe();
      roomSubscription.unsubscribe();
    });
  }

  setConfig(key: string, value: any) {
    this._configs$.next({
      ...this._configs$.value,
      [key]: value,
    });
  }

  init() {}

  render(dom: HTMLElement) {
    const root = createRoot(dom);
    root.render(
      createElement(this.view, {
        elll: this,
      }),
    );
  }
}
