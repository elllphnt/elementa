import { elllEntities } from "@elllphnt/utils";
import { Workspace as WorkspaceData } from "@elllphnt/workspace-service-client";
import { combineLatestOrEmpty } from "@repo/utils";
import { BehaviorSubject, map, Observable, switchMap } from "rxjs";
import { Backend } from "../lib/backend";
import { AutoSavableResource } from "../lib/resource";
import { intelligenceServiceFactory } from "../services/intelligence_service";
import { workspaceServiceFactory } from "../services/workspace_service";
import { Syncer } from "../syncer";
import { WorkspaceFile } from "./workspace_file";
import { IFileDrive } from "./file_drive";

export class Workspace
  extends AutoSavableResource<WorkspaceData>
  implements IFileDrive<WorkspaceFile>
{
  static readonly entity = elllEntities.workspace.name;

  private _pathFetches = new Map<string, Promise<WorkspaceFile | undefined>>();

  private _tenantId$ = new BehaviorSubject<string | undefined>(undefined);
  private _name$ = new BehaviorSubject<string | undefined>(undefined);

  get workspaceService() {
    return this.backend.service(workspaceServiceFactory);
  }
  get intelligenceService() {
    return this.backend.service(intelligenceServiceFactory);
  }

  get workspaceFileStore() {
    return this.backend.store(WorkspaceFile);
  }

  get name() {
    return this._name$.value;
  }
  get name$() {
    return this._name$.asObservable();
  }

  get tenantId() {
    return this._tenantId$.value;
  }
  get tenantId$() {
    return this._tenantId$.asObservable();
  }

  get changes() {
    return { name: this.name };
  }
  get changes$(): Observable<any> {
    return combineLatestOrEmpty([this.name$]).pipe(
      map((name) => ({
        name,
      })),
    );
  }

  fetchFileAtPath(path: string): Promise<WorkspaceFile | undefined> {
    let fetch = this._pathFetches.get(path);
    if (!fetch) {
      fetch = this.workspaceService
        .fetchWorkspaceFileAtPath({
          workspace_id: this.id,
          path,
        })
        .finally(() => {
          this._pathFetches.delete(path);
        });
      this._pathFetches.set(path, fetch);
    }
    return fetch;
  }

  fileAtPath(
    path: string,
    {
      autoFetch,
      create,
    }: {
      autoFetch?: boolean;
      create?: {
        type: string;
      };
    } = {},
  ) {
    (window as any).fs = this.workspaceFileStore;
    return this.workspaceFileStore.query({
      key: `workspace-file:${this.id}:${path}`,
      resolve: (files) => {
        return files
          .filter((file) => file.workspaceId === this.id)
          .find((file) => file.path === path);
      },
      resolve$: (files$) => {
        return files$.pipe(
          switchMap((files) => {
            return combineLatestOrEmpty(
              files
                .filter((file) => file.workspaceId === this.id)
                .map((file) =>
                  combineLatestOrEmpty([file.path$]).pipe(
                    map(([path]) => ({
                      path,
                      file,
                    })),
                  ),
                ),
            );
          }),
          map((files) => {
            return files.filter((f) => f.path?.startsWith(path));
          }),
          map((files) => {
            if (!files.length) {
              return undefined;
            } else {
              const actualFile = files.find((f) => f.path === path);
              if (actualFile) {
                return actualFile.file;
              } else {
                console.log("file exist but has not been fetched yet", {
                  path,
                });
                // the file exist but has not been fetched yet
                if (autoFetch) {
                  this.fetchFileAtPath(path);
                }
                return undefined;
              }
            }
          }),
        );
      },
      fetch: async () => {
        await this.workspaceService.fetchWorkspaceFileAtPath({
          workspace_id: this.id,
          path,
          create,
        });
      },
      autoFetch,
    });
  }
  file<C extends true | undefined>(fileId: string, create?: C) {
    const file = this.workspaceFileStore.instance(fileId, create);
    return file;
  }

  constructor({ id, backend }: { id: string; backend: Backend }) {
    super({
      id,
      backend,
      entity: Workspace.entity,
    });

    this.watchChanges();

    this.addDisposer(() => {
      this._tenantId$.complete();
      this._name$.complete();
    });

    this.addDisposer(this.watchFiles());
  }

  loadData(data: WorkspaceData) {
    this._tenantId$.next(data.tenant_id ?? undefined);
    this._name$.next(data.name);
  }

  setName(name: string) {
    return this._name$.next(name);
  }

  protected async saveData(): Promise<void> {
    await this.workspaceService.updateWorkspace(this.id, this.changes);
  }

  protected async fetchData(): Promise<void> {
    await this.workspaceService.fetchWorkspace(this.id);
  }

  createIntelligenceThread({
    title,
  }: {
    title?: string;
  } = {}) {
    const tenant_id = this.tenantId;
    if (!tenant_id) {
      return;
    }

    return this.intelligenceService.createThread({
      tenant_id,
      title,
    });
  }

  delete() {
    return this.workspaceService.deleteWorkspace(this.id);
  }

  watchFiles() {
    console.log("watching files");
    const syncer = Syncer.instance(this.backend);
    return syncer.watchEntities("workspace_file", {
      workspace_id: this.id,
    });
  }
}
