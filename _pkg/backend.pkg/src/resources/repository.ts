import { Repository as RepositoryData } from "@elllphnt/repository-service-client";
import {
  elllEntities,
  makeEntityId,
  parseEntityId,
  parseFileId,
} from "@elllphnt/utils";
import { File as WorkspaceFileData } from "@elllphnt/workspace-service-client";
import { combineLatestOrEmpty } from "@repo/utils";
import { BehaviorSubject, distinctUntilChanged, filter, map, tap } from "rxjs";
import { Backend } from "../lib/backend";
import { createConstructorFactory } from "../lib/factory";
import { AutoSavableResource } from "../lib/resource";
import {
  repositoryServiceFactory,
  VcsRecord,
} from "../services/repository_service";
import { FileContentEvent, Syncer } from "../syncer";
import { Commit } from "./commit";
import { RepositoryTag } from "./repository_tag";
import { Tenant } from "./tenant";
import { Workspace } from "./workspace";

const nullSha256 =
  "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";

export function driveToVcsFileId(file_id: string) {
  const idStruct = parseFileId(file_id);
  if (!idStruct) {
    throw new Error("Invalid file id");
  }
  return idStruct.bare_file_id;
}

export class Repository extends AutoSavableResource<RepositoryData> {
  static readonly entity = elllEntities.repository.name;

  private _tenantId$ = new BehaviorSubject<string | undefined>(undefined);
  private _name$ = new BehaviorSubject<string | undefined>(undefined);
  private _pointers$ = new BehaviorSubject<RepositoryData["pointers"]>([]);
  private _headCommitId$ = new BehaviorSubject<string | undefined>(undefined);
  private _workspaceId$ = new BehaviorSubject<string | undefined>(undefined);

  private _fetchingWorkspaceRecord$ = new BehaviorSubject<boolean>(false);
  private _workspaceRecord$ = new BehaviorSubject<VcsRecord | undefined>(
    undefined,
  );

  private _resettingWorkspace$ = new BehaviorSubject<boolean>(false);
  private _committingWorkspace$ = new BehaviorSubject<boolean>(false);

  get repositoryService() {
    return this.backend.service(repositoryServiceFactory);
  }

  get pointers() {
    return this._pointers$.value;
  }
  get pointers$() {
    return this._pointers$.asObservable();
  }

  pointer(name: string) {
    return this.pointers?.find((pointer) => pointer.name === name);
  }
  pointer$(name: string) {
    return this.pointers$.pipe(
      map((pointers) => pointers?.find((pointer) => pointer.name === name)),
    );
  }

  get tenantStore() {
    return this.backend.store(Tenant);
  }
  get commitStore() {
    return this.backend.store(Commit);
  }
  get workspaceStore() {
    return this.backend.store(Workspace);
  }
  get tagStore() {
    return this.backend.store(RepositoryTag);
  }

  get tenantId() {
    return this._tenantId$.value;
  }
  get tenantId$() {
    return this._tenantId$.asObservable().pipe(distinctUntilChanged());
  }

  get workspaceId() {
    return this._workspaceId$.value;
  }
  get workspaceId$() {
    return this._workspaceId$.asObservable().pipe(distinctUntilChanged());
  }

  get workspace() {
    return this.workspaceId
      ? this.workspaceStore.instance(this.workspaceId, true)
      : undefined;
  }
  get workspace$() {
    return combineLatestOrEmpty([this.workspaceId$]).pipe(
      map(([workspaceId]) =>
        workspaceId
          ? this.workspaceStore.instance(workspaceId, true)
          : undefined,
      ),
    );
  }

  get name() {
    return this._name$.value;
  }
  get name$() {
    return this._name$.asObservable().pipe(distinctUntilChanged());
  }

  get tenant() {
    return this.tenantId
      ? this.tenantStore.instance(this.tenantId, true)
      : undefined;
  }
  get tenant$() {
    return combineLatestOrEmpty([this.tenantId$]).pipe(
      map(([tenantId]) =>
        tenantId ? this.tenantStore.instance(tenantId, true) : undefined,
      ),
    );
  }

  get headCommitId() {
    return this._headCommitId$.value;
  }
  get headCommitId$() {
    return this._headCommitId$.asObservable().pipe(distinctUntilChanged());
  }

  get headCommit() {
    return this.headCommitId
      ? this.commitStore.instance(this.headCommitId, true)
      : undefined;
  }
  get headCommit$() {
    return this.headCommitId$.pipe(
      map((headCommitId) =>
        headCommitId
          ? this.commitStore.instance(headCommitId, true)
          : undefined,
      ),
    );
  }

  commits({ autoFetch }: { autoFetch?: boolean } = {}) {
    return this.commitStore.query({
      key: `repository-commits:${this.id}`,
      resolve$: (commits$) =>
        commits$.pipe(
          map((commits) =>
            commits
              .filter((c) => c.repositoryId === this.id)
              .sort((a, b) => {
                if (a.timestamp && b.timestamp) {
                  return b.timestamp - a.timestamp;
                } else {
                  return 0;
                }
              }),
          ),
        ),
      resolve: (commits) =>
        commits
          .filter((c) => c.repositoryId === this.id)
          .sort((a, b) => {
            if (a.timestamp && b.timestamp) {
              return b.timestamp - a.timestamp;
            } else {
              return 0;
            }
          }),
      fetch: async ({ cursor }) => {
        const limit = 20;
        const result = await this.repositoryService.fetchRepositoryCommits(
          this.id,
          {
            cursor,
            limit,
          },
        );

        return {
          cursor: result[result.length - 1]?.id,
          hasMore: result.length === limit,
        };
      },
      autoFetch,
    });
  }
  tags({ autoFetch }: { autoFetch?: boolean } = {}) {
    return this.tagStore.query({
      key: `repository-tags:${this.id}`,
      resolve$: (tags$) =>
        tags$.pipe(
          map((tags) =>
            tags
              .filter((c) => c.repositoryId === this.id)
              .sort((a, b) => {
                if (a.createdAt && b.createdAt) {
                  return b.createdAt.getTime() - a.createdAt.getTime();
                } else {
                  return 0;
                }
              }),
          ),
        ),
      resolve: (tags) =>
        tags
          .filter((c) => c.repositoryId === this.id)
          .sort((a, b) => {
            if (a.createdAt && b.createdAt) {
              return b.createdAt.getTime() - a.createdAt.getTime();
            } else {
              return 0;
            }
          }),
      fetch: async ({ cursor }) => {
        const limit = 20;
        const result = await this.repositoryService.fetchRepositoryTags(
          this.id,
          {
            cursor,
            limit,
          },
        );

        return {
          cursor: result[result.length - 1]?.id,
          hasMore: result.length === limit,
        };
      },
      autoFetch,
    });
  }

  get changes() {
    return {
      name: this._name$.value,
    };
  }
  get changes$() {
    return combineLatestOrEmpty([this.name$]).pipe(
      map(([name]) => ({
        name,
      })),
    );
  }

  get fetchingWorkspaceRecord$() {
    return this._fetchingWorkspaceRecord$.asObservable();
  }
  get fetchingWorkspaceRecord() {
    return this._fetchingWorkspaceRecord$.value;
  }

  get resettingWorkspace$() {
    return this._resettingWorkspace$.asObservable();
  }
  get resettingWorkspace() {
    return this._resettingWorkspace$.value;
  }

  get committingWorkspace$() {
    return this._committingWorkspace$.asObservable();
  }
  get committingWorkspace() {
    return this._committingWorkspace$.value;
  }

  workspaceRecord({
    autoFetch,
  }: {
    autoFetch?: boolean;
  } = {}) {
    const record = this._workspaceRecord$.value;
    if (!record && autoFetch) {
      this.fetchWorkspaceRecord();
    }
    return record;
  }
  workspaceRecord$({
    autoFetch,
  }: {
    autoFetch?: boolean;
  } = {}) {
    return this._workspaceRecord$.asObservable().pipe(
      distinctUntilChanged(),
      tap((record) => {
        if (!record && autoFetch) {
          this.fetchWorkspaceRecord();
        }
      }),
    );
  }

  constructor({ id, backend }: { id: string; backend: Backend }) {
    super({ backend, id, entity: Repository.entity });

    this.watchChanges();

    // listen to workspace file changes
    const syncer = Syncer.instance(this.backend);
    const workspaceFileEventSubscription = syncer.entityEvent$
      .pipe(
        filter(
          (event) =>
            event.payload.entity === "workspace_file" &&
            event.payload.workspace_id === this.workspaceId,
        ),
      )
      .subscribe((event) => {
        this.handleWorkspaceFileEvent(event);
      });

    const workspaceFileContentEventSubscription = syncer.fileContentEvent$
      .pipe(
        filter((event) => {
          const workspace_id = this.workspaceId;
          if (!workspace_id) return false;

          const bare_id = parseEntityId(workspace_id)?.bare_id;
          if (!bare_id) return false;

          const fileIdPrefix = makeEntityId({
            entity_name: "workspace_file",
            bare_id,
          });

          return event.payload.file_id.startsWith(fileIdPrefix);
        }),
      )
      .subscribe((event) => {
        this.handleWorkspaceFileContentEvent(event);
      });

    this.addDisposer(() => {
      workspaceFileContentEventSubscription.unsubscribe();
    });
    this.addDisposer(
      syncer.watchEntities("repository", {
        id: this.id,
      }),
    );

    this.addDisposer(() => {
      this._tenantId$.complete();
      this._name$.complete();
      this._headCommitId$.complete();
      this._workspaceId$.complete();
      this._fetchingWorkspaceRecord$.complete();
      this._workspaceRecord$.complete();
      this._resettingWorkspace$.complete();
      this._committingWorkspace$.complete();

      workspaceFileEventSubscription.unsubscribe();
    });
  }

  private writeWorkspaceFileToWorkspaceRecord(file: WorkspaceFileData) {
    const record = this._workspaceRecord$.value || {};
    const id = driveToVcsFileId(file.id);
    const entry = record[id] as VcsRecord[string] | undefined;

    this._workspaceRecord$.next({
      ...record,
      [id]: {
        type: file.type,
        path: file.path,
        sha: entry?.sha || nullSha256,
      },
    });
  }
  private removeWorkspaceFileFromWorkspaceRecord(fileId: string) {
    const record = this._workspaceRecord$.value || {};
    const id = driveToVcsFileId(fileId);
    const { [id]: _, ...rest } = record;

    this._workspaceRecord$.next(rest);
  }

  private handleWorkspaceFileEvent(event: any) {
    if (event.payload.type === "directory") {
      return;
    }

    if (event.topic === "entity.created") {
      this.writeWorkspaceFileToWorkspaceRecord(event.payload);
    } else if (event.topic === "entity.updated") {
      this.writeWorkspaceFileToWorkspaceRecord(event.payload);
    } else if (event.topic === "entity.deleted") {
      this.removeWorkspaceFileFromWorkspaceRecord(event.payload.id);
    }
  }
  private handleWorkspaceFileContentEvent(event: {
    topic: string;
    payload: FileContentEvent;
  }) {
    const record = this._workspaceRecord$.value || {};
    const id = driveToVcsFileId(event.payload.file_id);
    const entry = record[id] as VcsRecord[string] | undefined;

    if (entry) {
      this._workspaceRecord$.next({
        ...record,
        [id]: {
          ...entry,
          sha: event.payload.hash,
        },
      });
    }
  }

  setName(name: string) {
    this._name$.next(name);
  }

  async publish() {}

  loadData(data: RepositoryData) {
    this._name$.next(data.name);
    this._tenantId$.next(data.tenant_id);
    this._headCommitId$.next(data.head);
    this._workspaceId$.next(data.workspace_id);
    this._pointers$.next(data.pointers);
  }

  protected async fetchData() {
    await this.repositoryService.fetchRepository(this.id);
  }

  protected async saveData(): Promise<void> {
    await this.repositoryService.updateRepository(this.id, this.changes);
  }

  async commitWorkspace({
    message,
    committer,
    file_ids,
  }: {
    message: string;
    committer: string;
    file_ids?: string[];
  }) {
    this._committingWorkspace$.next(true);
    try {
      await this.repositoryService.commitRepositoryWorkspace(this.id, {
        message,
        committer,
        file_ids,
      });
    } finally {
      this._committingWorkspace$.next(false);
    }
  }
  async resetWorkspace({
    file_ids,
    commit_id,
  }: { file_ids?: string[]; commit_id?: string } = {}) {
    this._resettingWorkspace$.next(true);
    try {
      await this.repositoryService.resetRepositoryWorkspace(this.id, {
        file_ids,
        commit_id: commit_id,
      });
    } finally {
      this._resettingWorkspace$.next(false);
    }
  }

  createTag({ name, commit_id }: { name: string; commit_id: string }) {
    return this.repositoryService.createTag({
      repository_id: this.id,
      commit_id,
      name,
    });
  }

  async delete() {
    await this.repositoryService.deleteRepository(this.id);
  }

  setHeadCommitId(commitId: string) {
    this._headCommitId$.next(commitId);
  }

  async setPointer(name: string, tag_id: string) {
    let updated = false;
    const pointers =
      this._pointers$.value?.map((pointer) => {
        if (pointer.name === name) {
          updated = true;
          return { name, tag_id };
        } else {
          return pointer;
        }
      }) || [];

    if (!updated) {
      pointers.push({ name, tag_id });
    }

    await this.repositoryService.updateRepository(this.id, {
      pointers,
    });
  }
  async deletePointer(name: string) {
    const pointers =
      this._pointers$.value?.filter((pointer) => pointer.name !== name) || [];

    await this.repositoryService.updateRepository(this.id, {
      pointers,
    });
  }

  loadWorkspaceRecord(record: VcsRecord) {
    this._workspaceRecord$.next(record);
  }
  async fetchWorkspaceRecord() {
    if (this.fetchingWorkspaceRecord) {
      return;
    }

    this._fetchingWorkspaceRecord$.next(true);
    try {
      const record =
        await this.repositoryService.fetchRepositoryWorkspaceRecord(this.id);
      this.loadWorkspaceRecord(record);
    } finally {
      this._fetchingWorkspaceRecord$.next(false);
    }
  }
  ensureWorkspaceRecord() {
    if (!this.workspaceRecord()) {
      this.fetchWorkspaceRecord();
    }
  }
}

export const repositoryFactory = createConstructorFactory(Repository, {
  name: "repository",
});
