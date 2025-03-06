import { CommitFile as CommitFileData } from "@elllphnt/repository-service-client";
import { elllEntities } from "@elllphnt/utils";
import { BehaviorSubject } from "rxjs";
import { Backend } from "../lib/backend";
import { createConstructorFactory } from "../lib/factory";
import { Store } from "../lib/store";
import { repositoryServiceFactory } from "../services/repository_service";
import { File } from "./file";

export class CommitFile extends File<CommitFileData> {
  static readonly entity = elllEntities.commitFile.name;

  private _commitId$ = new BehaviorSubject<string | undefined>(undefined);
  private _content$ = new BehaviorSubject<string | undefined>(undefined);
  private _fetchingContent$ = new BehaviorSubject<boolean>(false);

  get repositoryService() {
    return this.backend.service(repositoryServiceFactory);
  }
  get fileStore() {
    return this.backend.store(CommitFile) as unknown as Store<File>;
  }

  get commitId() {
    return this._commitId$.value;
  }
  get commitId$() {
    return this._commitId$.asObservable();
  }

  get driveId() {
    return this.commitId;
  }
  get driveId$() {
    return this.commitId$;
  }

  get content() {
    return this._content$.value;
  }
  get content$() {
    return this._content$.asObservable();
  }

  get fetchingContent() {
    return this._fetchingContent$.value;
  }
  get fetchingContent$() {
    return this._fetchingContent$.asObservable();
  }

  constructor({ backend, id }: { id: string; backend: Backend }) {
    super({
      id,
      backend,
      entity: CommitFile.entity,
    });
  }

  async fetchData() {
    await this.repositoryService.fetchCommitFile(this.id);
  }
  async fetchEntryData(): Promise<void> {
    if (!this.commitId || this.path === undefined) {
      return;
    }
    await this.repositoryService.fetchCommitFiles({
      commit_id: this.commitId,
      path: this.path,
      depth: 2,
    });
  }

  async createEntry(): Promise<File> {
    throw new Error("Cannot create entries for commit files.");
  }
  async updateData() {
    throw new Error("Cannot update commit files.");
  }
  async updateContent() {
    throw new Error("Cannot set content for commit files.");
  }
  async deleteData(): Promise<void> {
    throw new Error("Cannot delete commit files.");
  }
  async duplicateData(): Promise<File> {
    throw new Error("Cannot duplicate commit files.");
  }

  async fetchContent() {
    this._fetchingContent$.next(true);
    try {
      await this.repositoryService.fetchCommitFileContent(this.id);
    } finally {
      this._fetchingContent$.next(false);
    }
  }
  setContent(content: string) {
    this._content$.next(content);
  }

  protected loadData(data: CommitFileData): void {
    this._commitId$.next(data.commit_id);
    super.loadData(data);
  }
}

export const commitFileFactory = createConstructorFactory(CommitFile, {
  name: "commit-file",
});
