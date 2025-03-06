import { Tag as TagData } from "@elllphnt/repository-service-client";
import { elllEntities } from "@elllphnt/utils";
import { BehaviorSubject, map } from "rxjs";
import { Backend } from "../lib/backend";
import { Resource } from "../lib/resource";
import { repositoryServiceFactory } from "../services/repository_service";
import { Commit } from "./commit";
import { Repository } from "./repository";

export class RepositoryTag extends Resource<TagData> {
  static readonly entity = elllEntities.repositoryTag.name;

  private _commitId$ = new BehaviorSubject<string | undefined>(undefined);
  private _repositoryId$ = new BehaviorSubject<string | undefined>(undefined);
  private _name$ = new BehaviorSubject<string | undefined>(undefined);
  private _createdAt$ = new BehaviorSubject<Date | undefined>(undefined);

  get repositoryService() {
    return this.backend.service(repositoryServiceFactory);
  }
  get repositoryStore() {
    return this.backend.store(Repository);
  }
  get commitStore() {
    return this.backend.store(Commit);
  }

  get commitId() {
    return this._commitId$.value;
  }
  get commitId$() {
    return this._commitId$.asObservable();
  }

  get repositoryId() {
    return this._repositoryId$.value;
  }
  get repositoryId$() {
    return this._repositoryId$.asObservable();
  }

  get name() {
    return this._name$.value;
  }
  get name$() {
    return this._name$.asObservable();
  }

  get createdAt() {
    return this._createdAt$.value;
  }
  get createdAt$() {
    return this._createdAt$.asObservable();
  }

  get commit() {
    return this.commitId
      ? this.commitStore.instance(this.commitId, true)
      : undefined;
  }
  get commit$() {
    return this.commitId$.pipe(
      map((commitId) => {
        return commitId ? this.commitStore.instance(commitId, true) : undefined;
      }),
    );
  }

  constructor({ id, backend }: { id: string; backend: Backend }) {
    super({
      id,
      backend,
      entity: RepositoryTag.entity,
    });

    this.addDisposer(() => {
      this._commitId$.complete();
      this._repositoryId$.complete();
    });
  }

  loadData(data: TagData) {
    this._commitId$.next(data.commit_id);
    this._repositoryId$.next(data.repository_id);
    this._name$.next(data.name);
    this._createdAt$.next(
      data.created_at ? new Date(data.created_at) : undefined,
    );
  }

  fetchData() {
    return this.repositoryService.fetchTag(this.id);
  }
}
