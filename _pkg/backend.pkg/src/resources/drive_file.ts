import { File as DriveFileData } from "@elllphnt/drive-service-client";
import {
  elllEntities,
  makeElllDriveFileUrl,
  parseFileId,
} from "@elllphnt/utils";
import { BehaviorSubject, map } from "rxjs";
import { Backend } from "../lib/backend";
import { Store } from "../lib/store";
import { driveServiceFactory } from "../services/drive_service";
import { Drive } from "./drive";
import { File as ElllFile } from "./file";

export class DriveFile extends ElllFile<DriveFileData> {
  static readonly entity = elllEntities.driveFile.name;

  readonly edfUrl: string;
  private _driveId$ = new BehaviorSubject<string | undefined>(undefined);

  get driveService() {
    return this.backend.service(driveServiceFactory);
  }

  get fileStore() {
    return this.backend.store(DriveFile) as unknown as Store<ElllFile>;
  }
  get driveStore() {
    return this.backend.store(Drive) as unknown as Store<Drive>;
  }

  get driveId() {
    return this._driveId$.value;
  }
  get driveId$() {
    return this._driveId$.asObservable();
  }

  get drive() {
    return this.driveId
      ? this.driveStore.instance(this.driveId, true)
      : undefined;
  }
  get drive$() {
    return this.driveId$.pipe(
      map((driveId) =>
        driveId ? this.driveStore.instance(driveId, true) : undefined,
      ),
    );
  }

  constructor({ id, backend }: { id: string; backend: Backend }) {
    super({ id, backend, entity: DriveFile.entity });

    const idStruct = parseFileId(this.id);
    if (!idStruct) {
      console.error(`Invalid drive file id: ${this.id}`);
      this.edfUrl = "";
    } else {
      const { bare_drive_id, bare_file_id } = idStruct;
      this.edfUrl = makeElllDriveFileUrl(bare_drive_id, bare_file_id);
    }

    this.addDisposer(() => {
      this._driveId$.complete();
    });
  }

  fetchData(): Promise<void> {
    return this.driveService.fetchDriveFile(this.id);
  }
  async fetchEntryData(): Promise<void> {
    if (!this.driveId) {
      return;
    }
    await this.driveService.fetchDriveFiles({
      drive_id: this.driveId,
      path: this.path,
      depth: 1,
    });
  }
  async updateData(update: { path?: string; type?: string }): Promise<void> {
    await this.driveService.updateDriveFile(this.id, update);
  }
  async createEntry({
    type,
    name,
  }: {
    type: string;
    name: string;
  }): Promise<ElllFile | undefined> {
    if (!this.driveId) {
      return;
    }
    const file = await this.driveService.createDriveFile({
      drive_id: this.driveId,
      type,
      path: `${this.path}/${name}`,
    });
    return file;
  }
  async deleteData(): Promise<void> {
    await this.driveService.deleteDriveFile(this.id);
  }
  async duplicateData(): Promise<ElllFile> {
    throw new Error("Method not implemented.");
  }

  async getSignedFileUrl(action: "read" | "write") {
    return this.driveService.getSignedFileUrl(this.id, action);
  }

  protected loadData(data: DriveFileData): void {
    this._driveId$.next(data.drive_id);
    super.loadData(data);
  }

  uploadFiles(files: File[] | FileList) {
    return this.drive?.uploadFiles(files, this.path);
  }
}
