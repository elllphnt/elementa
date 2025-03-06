import { elllEntities } from "@elllphnt/utils";
import { File as WorkspaceFileData } from "@elllphnt/workspace-service-client";
import { BehaviorSubject } from "rxjs";
import { Backend } from "../lib/backend";
import { Store } from "../lib/store";
import { workspaceServiceFactory } from "../services/workspace_service";
import { File } from "./file";

export class WorkspaceFile extends File<WorkspaceFileData> {
  static readonly entity = elllEntities.workspaceFile.name;

  private _workspaceId$ = new BehaviorSubject<string | undefined>(undefined);

  get workspaceService() {
    return this.backend.service(workspaceServiceFactory);
  }

  get fileStore() {
    return this.backend.store(WorkspaceFile) as unknown as Store<File>;
  }

  get workspaceId() {
    return this._workspaceId$.value;
  }
  get workspaceId$() {
    return this._workspaceId$.asObservable();
  }

  get driveId() {
    return this.workspaceId;
  }
  get driveId$() {
    return this.workspaceId$;
  }

  constructor({ id, backend }: { id: string; backend: Backend }) {
    super({ id, backend, entity: WorkspaceFile.entity });

    this.addDisposer(() => {
      this._workspaceId$.complete();
    });
  }

  fetchData(): Promise<void> {
    return this.workspaceService.fetchWorkspaceFile(this.id);
  }
  async fetchEntryData(): Promise<void> {
    if (!this.workspaceId) {
      return;
    }
    await this.workspaceService.fetchWorkspaceFiles({
      workspace_id: this.workspaceId,
      path: this.path,
      depth: 1,
    });
  }
  async updateData(update: { path?: string; type?: string }): Promise<void> {
    await this.workspaceService.updateWorkspaceFile(this.id, update);
  }
  async createEntry({
    type,
    name,
  }: {
    type: string;
    name: string;
  }): Promise<File | undefined> {
    if (!this.workspaceId) {
      return;
    }
    const file = await this.workspaceService.createWorkspaceFile({
      workspace_id: this.workspaceId,
      type,
      path: `${this.path}/${name}`,
    });
    return file;
  }
  async deleteData(): Promise<void> {
    await this.workspaceService.deleteWorkspaceFile(this.id);
  }
  async duplicateData(): Promise<File> {
    throw new Error("Method not implemented.");
  }

  protected loadData(data: WorkspaceFileData): void {
    this._workspaceId$.next(data.workspace_id);
    super.loadData(data);
  }
}
