import { Commit as CommitData } from "@elllphnt/repository-service-client";
import { elllEntities } from "@elllphnt/utils";
import { combineLatestOrEmpty } from "@repo/utils";
import {
  BehaviorSubject,
  distinctUntilChanged,
  map,
  switchMap,
  tap,
} from "rxjs";
import { Backend } from "../lib/backend";
import { Resource } from "../lib/resource";
import {
  repositoryServiceFactory,
  VcsRecord,
} from "../services/repository_service";
import { CommitFile } from "./commit_file";
import { IFileDrive } from "./file_drive";
import { Repository } from "./repository";

export class Commit
  extends Resource<CommitData>
  implements IFileDrive<CommitFile>
{
  static readonly entity = elllEntities.commit.name;

  private _sha$ = new BehaviorSubject<string | undefined>(undefined);
  private _repositoryId$ = new BehaviorSubject<string | undefined>(undefined);
  private _parent$ = new BehaviorSubject<string | undefined>(undefined);
  private _message$ = new BehaviorSubject<string | undefined>(undefined);
  private _committer$ = new BehaviorSubject<string | undefined>(undefined);
  private _timestamp$ = new BehaviorSubject<number | undefined>(undefined);
  private _fetchingRecord$ = new BehaviorSubject<boolean>(false);
  private _record$ = new BehaviorSubject<VcsRecord | undefined>(undefined);

  get repositoryService() {
    return this.backend.service(repositoryServiceFactory);
  }
  get repositoryStore() {
    return this.backend.store(Repository);
  }
  get commitFileStore() {
    return this.backend.store(CommitFile);
  }

  get sha() {
    return this._sha$.value;
  }
  get sha$() {
    return this._sha$.asObservable();
  }

  get repositoryId() {
    return this._repositoryId$.value;
  }
  get repositoryId$() {
    return this._repositoryId$.asObservable();
  }

  get parent() {
    return this._parent$.value;
  }
  get parent$() {
    return this._parent$.asObservable();
  }

  get message() {
    return this._message$.value;
  }
  get message$() {
    return this._message$.asObservable();
  }

  get committer() {
    return this._committer$.value;
  }
  get committer$() {
    return this._committer$.asObservable();
  }

  get timestamp() {
    return this._timestamp$.value;
  }
  get timestamp$() {
    return this._timestamp$.asObservable();
  }

  get fetchingRecord$() {
    return this._fetchingRecord$.asObservable();
  }
  get fetchingRecord() {
    return this._fetchingRecord$.value;
  }

  record({
    autoFetch,
  }: {
    autoFetch?: boolean;
  } = {}) {
    const record = this._record$.value;
    if (!record && autoFetch) {
      this.fetchRecord();
    }
    return record;
  }
  record$({
    autoFetch,
  }: {
    autoFetch?: boolean;
  } = {}) {
    return this._record$.asObservable().pipe(
      distinctUntilChanged(),
      tap((record) => {
        if (!record && autoFetch) {
          this.fetchRecord();
        }
      }),
    );
  }

  constructor({ id, backend }: { id: string; backend: Backend }) {
    super({
      id,
      backend,
      entity: Commit.entity,
    });

    this.addDisposer(() => {
      this._sha$.complete();
      this._repositoryId$.complete();
      this._parent$.complete();
      this._message$.complete();
      this._committer$.complete();
      this._timestamp$.complete();
      this._fetchingRecord$.complete();
      this._record$.complete();
    });
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
    return this.commitFileStore.query({
      key: `commit-file:${this.id}:${path}`,
      resolve: (files) => {
        return files
          .filter((file) => file.commitId === this.id)
          .find((file) => file.path === path);
      },
      resolve$: (files$) => {
        return files$.pipe(
          switchMap((files) => {
            return combineLatestOrEmpty(
              files
                .filter((file) => file.commitId === this.id)
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
            return files.find((file) => file.path === path)?.file;
          }),
        );
      },
      fetch: async () => {
        await this.repositoryService.fetchCommitFileAtPath({
          commit_id: this.id,
          path,
        });
      },
      autoFetch,
    });
  }
  file<C extends true | undefined>(id: string, create?: C) {
    return this.commitFileStore.instance(id, create);
  }

  loadData(data: CommitData) {
    this._sha$.next(data.sha);
    this._repositoryId$.next(data.repository_id);
    this._parent$.next(data.parent ?? undefined);
    this._message$.next(data.message);
    this._committer$.next(data.committer);
    this._timestamp$.next(new Date(data.timestamp).getTime());
  }

  createFile({
    type,
    path,
  }: {
    type: string;
    path: string;
  }): Promise<CommitFile> {
    throw new Error("Cannot create file in commit");
  }

  fetchData() {
    return this.repositoryService.fetchCommit(this.id);
  }

  loadRecord(record: VcsRecord) {
    this._record$.next(record);
  }
  async fetchRecord() {
    if (this.fetchingRecord) {
      return;
    }

    this._fetchingRecord$.next(true);
    try {
      const record = await this.repositoryService.fetchCommitRecord(this.id);
      this.loadRecord(record);
    } finally {
      this._fetchingRecord$.next(false);
    }
  }
  ensureRecord() {
    if (!this.record()) {
      this.fetchRecord();
    }
  }
}
