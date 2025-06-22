/* eslint-disable @typescript-eslint/no-explicit-any */
import { type PackageData } from "@elllphnt/elementa-base";
import {
  AsyncResourceStatus,
  Content,
  File,
  FileModelAdaptor,
  Infrastructure,
  Project,
  type FileModelType,
} from "@elllphnt/elementa-core";
import { StatefulFileModelAdaptor } from "@elllphnt/elementa-models";
import {
  BehaviorSubject,
  combineLatest,
  filter,
  firstValueFrom,
  map,
  type Observable,
} from "rxjs";
import { backend } from "./backend.js";
import type { FileData } from "./types.js";

export class ServerFileModelAdaptor<
  T extends FileModelType
> extends StatefulFileModelAdaptor<T, ServerFile> {
  private _data$ = new BehaviorSubject<any>(undefined);
  private fileChangeSubscription: any;

  get data(): any {
    return this._data$.getValue();
  }
  get data$(): Observable<any> {
    return this._data$.asObservable();
  }

  constructor({ file, modelType }: { file: ServerFile; modelType: T }) {
    super({ file, modelType });

    // Initial load
    this.loadContent();

    this.addDisposer(() => {
      this._data$.complete();
      if (this.fileChangeSubscription) {
        this.fileChangeSubscription.unsubscribe();
      }
    });

    this.watchData();
  }

  private loadContent(): void {
    this.setStatus(AsyncResourceStatus.Pending);

    this.file.content.text$.subscribe((content) => {
      try {
        const data = content.trim() ? JSON.parse(content) : {};
        this._data$.next(data);
        this.setStatus(AsyncResourceStatus.Resolved);
      } catch (error) {
        this._data$.next({});
        this.setStatus(
          AsyncResourceStatus.Errored,
          error instanceof Error ? error : new Error("Invalid JSON format")
        );
        console.error(`Error parsing JSON for file ${this.file.id}:`, error);
      }
    });
  }

  getModel() {
    return firstValueFrom(
      this.model$.pipe(filter((model) => model !== undefined))
    );
  }

  async save(): Promise<void> {
    // Note: This is read-only for the server viewer
    throw new Error("Server files are read-only");
  }
}

export class ServerFileContent extends Content<ServerFile> {
  get data(): string | undefined {
    return backend.fileContent(this.file.project.id, this.file.id);
  }
  get data$(): Observable<string | undefined> {
    return backend
      .fileContent$(this.file.project.id, this.file.id)
      .pipe(map((content) => content));
  }

  get text(): string {
    return this.data || "";
  }
  get text$(): Observable<string> {
    return this.data$.pipe(map((content) => content || ""));
  }

  constructor({ file }: { file: ServerFile }) {
    super({ file });

    const statusSubscription = combineLatest({
      data: this.data$,
      status: backend.fileContentStatus$(this.file.project.id, this.file.id),
    }).subscribe(({ data, status }) => {
      if (data !== undefined) {
        this.setStatus(AsyncResourceStatus.Resolved);
      } else {
        if (status === "idle") {
          this.setStatus(AsyncResourceStatus.Pending);
        } else if (status === "loading") {
          this.setStatus(AsyncResourceStatus.Pending);
        } else if (status === "loaded") {
          this.setStatus(AsyncResourceStatus.Missing);
        }
      }
    });

    this.fetch();

    this.addDisposer(() => {
      statusSubscription.unsubscribe();
    });
  }

  fetch() {
    return backend.fetchFileContent(this.file.project.id, this.file.id);
  }
}

export class ServerFile extends File {
  get data(): FileData | undefined {
    return backend.file(this.project.id, this.id);
  }
  get data$(): Observable<FileData | undefined> {
    return backend.file$(this.project.id, this.id);
  }

  get path() {
    return this.data?.path;
  }
  get path$() {
    return this.data$.pipe(map((data) => data?.path));
  }

  get type() {
    return this.data?.type;
  }
  get type$() {
    return this.data$.pipe(map((data) => data?.type));
  }

  constructor({ id, project }: { id: string; project: ServerProject }) {
    super({ id, project });

    const statusSubscription = combineLatest({
      data: this.data$,
      status: backend.projectFilesStatus$(project.id),
    }).subscribe(({ data, status }) => {
      if (status === "idle") {
        this.setStatus(AsyncResourceStatus.Pending);
      } else if (status === "loading") {
        this.setStatus(AsyncResourceStatus.Pending);
      } else if (status === "loaded") {
        if (data) {
          this.setStatus(AsyncResourceStatus.Resolved);
        } else {
          this.setStatus(AsyncResourceStatus.Missing);
        }
      }
    });

    this.addDisposer(() => {
      statusSubscription.unsubscribe();
    });
  }
}

export class ServerProject extends Project {
  private _filesMap$ = new BehaviorSubject<Record<string, string>>({}); // path -> id mapping

  private _files: Map<string, ServerFile> = new Map();
  private _fileModelAdaptors: Map<
    string,
    ServerFileModelAdaptor<FileModelType>
  > = new Map();
  private _contents: Map<string, ServerFileContent> = new Map();

  constructor({
    id,
    infrastructure,
  }: {
    id: string;
    infrastructure: ElementaServerInfrastructure;
  }) {
    super({ id, infrastructure });

    backend.projectFiles$(id).subscribe((files) => {
      const newMap: Record<string, string> = {};
      files.forEach((file) => {
        newMap[file.path] = file.id;
        this.file(file.id); // Ensure file is created
      });
      this._filesMap$.next(newMap);
    });
  }

  file(id: string): ServerFile {
    let file = this._files.get(id);
    if (!file) {
      file = new ServerFile({ id, project: this });
      this._files.set(id, file);
    }
    return file;
  }

  fileModelAdaptor<T extends FileModelType>(
    modelType: T,
    fileId: string
  ): FileModelAdaptor<T, File> {
    const key = `${modelType}:${fileId}`;
    let adaptor = this._fileModelAdaptors.get(key);
    if (!adaptor) {
      adaptor = new ServerFileModelAdaptor<T>({
        modelType,
        file: this.file(fileId) as ServerFile,
      });
      this._fileModelAdaptors.set(key, adaptor);
    }
    return adaptor as FileModelAdaptor<T, File>;
  }

  fileAtPath(path: string): File | undefined {
    const id = this._filesMap$.getValue()[path];
    if (id) {
      return this.file(id);
    }
    return undefined;
  }

  fileAtPath$(path: string): Observable<File | undefined> {
    return this._filesMap$.pipe(
      map((map) => {
        const id = map[path];
        if (id) return this.file(id);
        else return undefined;
      })
    );
  }

  content(fileId: string): Content<File> {
    let content = this._contents.get(fileId);
    if (!content) {
      content = new ServerFileContent({ file: this.file(fileId) });
      this._contents.set(fileId, content);
    }
    return content;
  }

  installPackages(): Promise<PackageData[]> {
    throw new Error("Package installation not supported for server projects");
  }
}

export class ElementaServerInfrastructure extends Infrastructure {
  private _projects: Map<string, ServerProject> = new Map();

  project(id: string): ServerProject {
    let project = this._projects.get(id);
    if (!project) {
      try {
        project = new ServerProject({ id, infrastructure: this });
        this._projects.set(id, project);
      } catch (error) {
        console.error(`Error fetching project ${id}:`, error);
        throw error;
      }
    }
    return project;
  }

  resolveStaticReference<T>(): Promise<T> {
    throw new Error("Method not implemented.");
  }
}

export const infrastructure = new ElementaServerInfrastructure();
