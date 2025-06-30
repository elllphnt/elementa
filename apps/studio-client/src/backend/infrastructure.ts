/* eslint-disable @typescript-eslint/no-explicit-any */
import { type PackageData } from "@elllphnt/elementa-base";
import { JsonRecordState } from "@elllphnt/elementa-json-backend";
import { Lifecycle, type Logger } from "@elllphnt/elementa-kernel";
import {
  AsyncResourceStatus,
  Content,
  File,
  FileModelAdaptor,
  Infrastructure,
  Project,
  type FileModelType,
  type FileModelTypeName,
} from "@elllphnt/elementa-models";
import { BehaviorSubject, combineLatest, map, type Observable } from "rxjs";
import { backend } from "./backend.js";
import type { FileData } from "./types.js";

function createLogger(context: Record<string, any> = {}): Logger {
  return {
    debug: (message: string, context: Record<string, any>) => {
      console.debug(message, context);
    },
    info: (message: string, context: Record<string, any>) => {
      console.info(message, context);
    },
    warn: (message: string, context: Record<string, any>) => {
      console.warn(message, context);
    },
    error: (message: string, context: Record<string, any>) => {
      console.error(message, context);
    },

    withContext: (newContext: Record<string, any>) => {
      return createLogger({ ...context, ...newContext });
    },
  };
}

Lifecycle.logger = createLogger({});

export class ServerFileModelAdaptor<
  T extends FileModelTypeName
> extends FileModelAdaptor<T, ServerFile> {
  private _state$ = new BehaviorSubject<FileModelType<T>["state"] | undefined>(
    undefined
  );

  get state() {
    return this._state$.getValue();
  }
  get state$() {
    return this._state$.asObservable();
  }

  constructor({ modelType, file }: { modelType: T; file: ServerFile }) {
    super({ modelType, file });

    this.addInitializer(() => {
      const stateSubscription = file.content.text$.subscribe((text) => {
        if (!text) {
          this._state$.next(undefined);
          return;
        }
        try {
          const data = JSON.parse(text);
          const state = new JsonRecordState(data);
          state.initialize();
          this._state$.next(state);
        } catch (error) {
          Lifecycle.logger?.error(
            `Failed to parse file content for model type ${modelType}`,
            { fileId: file.id, error }
          );
          this._state$.next(undefined);
          return;
        }
      });
      this.addDisposer(() => {
        stateSubscription.unsubscribe();
      });
    });
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
    ServerFileModelAdaptor<FileModelTypeName>
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

    this.addInitializer(() => {
      const filesSubscription = backend.projectFiles$(id).subscribe((files) => {
        const newMap: Record<string, string> = {};
        files.forEach((file) => {
          newMap[file.path] = file.id;
          this.file(file.id); // Ensure file is created
        });
        this._filesMap$.next(newMap);
      });

      this.addDisposer(() => {
        filesSubscription.unsubscribe();
      });
    });
  }

  file(id: string): ServerFile {
    let file = this._files.get(id);
    if (!file) {
      file = new ServerFile({ id, project: this });
      file.initialize();
      this._files.set(id, file);
    }
    return file;
  }

  fileModelAdaptor<T extends FileModelTypeName>(
    modelType: T,
    fileId: string
  ): ServerFileModelAdaptor<T> {
    const key = `${modelType}:${fileId}`;
    let adaptor = this._fileModelAdaptors.get(key);
    if (!adaptor) {
      adaptor = new ServerFileModelAdaptor<T>({
        modelType,
        file: this.file(fileId) as ServerFile,
      });
      adaptor.initialize();
      this._fileModelAdaptors.set(key, adaptor);
    }
    return adaptor as ServerFileModelAdaptor<T>;
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
      content.initialize();
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
        project.initialize();
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
infrastructure.initialize();
