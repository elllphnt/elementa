import { Drive as DriveData } from "@elllphnt/drive-service-client";
import { elllEntities } from "@elllphnt/utils";
import { combineLatestOrEmpty } from "@repo/utils";
import { BehaviorSubject, map, Observable, switchMap } from "rxjs";
import { Backend } from "../lib/backend";
import { AutoSavableResource } from "../lib/resource";
import { driveServiceFactory } from "../services/drive_service";
import { intelligenceServiceFactory } from "../services/intelligence_service";
import { Syncer } from "../syncer";
import { DriveFile } from "./drive_file";
import { IFileDrive } from "./file_drive";

export class Drive
  extends AutoSavableResource<DriveData>
  implements IFileDrive<DriveFile>
{
  static readonly entity = elllEntities.drive.name;

  private _pathFetches = new Map<string, Promise<DriveFile | undefined>>();

  private _tenantId$ = new BehaviorSubject<string | undefined>(undefined);
  private _name$ = new BehaviorSubject<string | undefined>(undefined);
  private _uploading$ = new BehaviorSubject<boolean>(false);

  get driveService() {
    return this.backend.service(driveServiceFactory);
  }
  get intelligenceService() {
    return this.backend.service(intelligenceServiceFactory);
  }

  get driveFileStore() {
    return this.backend.store(DriveFile);
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

  get uploading$() {
    return this._uploading$.asObservable();
  }
  get uploading() {
    return this._uploading$.value;
  }

  fetchFileAtPath(path: string): Promise<DriveFile | undefined> {
    let fetch = this._pathFetches.get(path);
    if (!fetch) {
      fetch = this.driveService
        .fetchDriveFileAtPath({
          drive_id: this.id,
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
    (window as any).fs = this.driveFileStore;
    return this.driveFileStore.query({
      key: `drive-file:${this.id}:${path}`,
      resolve: (files) => {
        return files
          .filter((file) => file.driveId === this.id)
          .find((file) => file.path === path);
      },
      resolve$: (files$) => {
        return files$.pipe(
          switchMap((files) => {
            return combineLatestOrEmpty(
              files
                .filter((file) => file.driveId === this.id)
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
        await this.driveService.fetchDriveFileAtPath({
          drive_id: this.id,
          path,
          create,
        });
      },
      autoFetch,
    });
  }
  file<C extends true | undefined>(fileId: string, create?: C) {
    const file = this.driveFileStore.instance(fileId, create);
    return file;
  }

  constructor({ id, backend }: { id: string; backend: Backend }) {
    super({
      id,
      backend,
      entity: Drive.entity,
    });

    this.watchChanges();

    this.addDisposer(() => {
      this._tenantId$.complete();
      this._name$.complete();
    });

    this.addDisposer(this.watchFiles());
  }

  loadData(data: DriveData) {
    this._tenantId$.next(data.tenant_id ?? undefined);
    this._name$.next(data.name);
  }

  setName(name: string) {
    return this._name$.next(name);
  }

  protected async saveData(): Promise<void> {
    await this.driveService.updateDrive(this.id, this.changes);
  }

  protected async fetchData(): Promise<void> {
    await this.driveService.fetchDrive(this.id);
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
    return this.driveService.deleteDrive(this.id);
  }

  createFile({ type, path }: { type: string; path: string }) {
    const file = this.driveService.createDriveFile({
      drive_id: this.id,
      type,
      path,
    });
    return file;
  }

  watchFiles() {
    console.log("watching files");
    const syncer = Syncer.instance(this.backend);
    return syncer.watchEntities("drive_file", {
      drive_id: this.id,
    });
  }

  setUploading(uploading: boolean) {
    this._uploading$.next(uploading);
  }

  uploadFiles(files: File[] | FileList, path?: string) {
    this.setUploading(true);
    return this.driveService
      .uploadFiles({
        drive_id: this.id,
        files,
        path: path || "",
      })
      .finally(() => {
        this.setUploading(false);
      });
  }
}
