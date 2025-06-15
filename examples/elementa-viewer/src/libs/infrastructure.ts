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
  filter,
  firstValueFrom,
  of,
  type Observable,
} from "rxjs";
import { elementaAPI } from "../api";
import type { FileData, ProjectData } from "../types";

export class ServerFileModelAdaptor<
  T extends FileModelType
> extends StatefulFileModelAdaptor<T, ServerFile> {
  private _data$ = new BehaviorSubject<any>(undefined);

  get data(): any {
    return this._data$.getValue();
  }
  get data$(): Observable<any> {
    return this._data$.asObservable();
  }

  constructor({ file, modelType }: { file: ServerFile; modelType: T }) {
    super({ file, modelType });

    file.textContentPromise
      .then((content) => {
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
          console.error(`Error parsing JSON for file ${file.id}:`, error);
        }
      })
      .catch((error) => {
        this._data$.next(undefined);
        this.setStatus(AsyncResourceStatus.Errored, error);
        console.error(`Error fetching content for file ${file.id}:`, error);
      });

    this.addDisposer(() => {
      this._data$.complete();
    });

    this.watchData();
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
  private _text$ = new BehaviorSubject<string>("");

  get text(): string {
    return this._text$.getValue();
  }
  get text$(): Observable<string> {
    return this._text$.asObservable();
  }

  constructor({ file }: { file: ServerFile }) {
    super({ file });

    file.textContentPromise
      .then((content) => {
        this._text$.next(content);
        this.setStatus(AsyncResourceStatus.Resolved);
      })
      .catch((error) => {
        this._text$.next("");
        this.setStatus(AsyncResourceStatus.Errored, error);
        console.error(`Error fetching content for file ${file.id}:`, error);
      });

    this.addDisposer(() => {
      this._text$.complete();
    });
  }
}

export class ServerFile extends File {
  private _path: string;
  private _type: string;
  textContentPromise: Promise<string>;

  get path(): string {
    return this._path;
  }
  get path$(): Observable<string> {
    return of(this._path);
  }

  get type(): string {
    return this._type;
  }

  get content() {
    return this.project.content(this.id);
  }

  constructor({
    fileData,
    project,
  }: {
    fileData: FileData;
    project: ServerProject;
  }) {
    super({ id: fileData.id, project });
    this._path = fileData.path;
    this._type = fileData.type;
    this.setStatus(AsyncResourceStatus.Resolved);
    this.textContentPromise = this._fetchContent();
  }

  private async _fetchContent(): Promise<string> {
    try {
      return await elementaAPI.getFileContent(this.project.id, this.id);
    } catch (error) {
      console.error(`Error fetching content for file ${this.id}:`, error);
      throw error;
    }
  }
}

export class ServerProject extends Project {
  private _files: Map<string, ServerFile> = new Map();
  private _fileModelAdaptors: Map<
    string,
    ServerFileModelAdaptor<FileModelType>
  > = new Map();
  private _content: Map<string, ServerFileContent> = new Map();
  private _fileAtPathSubjects: Map<string, BehaviorSubject<File | undefined>> =
    new Map();
  private _filesCache: Map<string, FileData[]> = new Map();

  constructor({
    id,
    infrastructure,
  }: {
    id: string;
    infrastructure: ElementaServerInfrasture;
  }) {
    super({ id, infrastructure });
  }

  file(id: string): File {
    let file = this._files.get(id);
    if (!file) {
      // We need to fetch file data first
      this._fetchFileData(id).then((fileData) => {
        if (fileData) {
          file = new ServerFile({ fileData, project: this });
          this._files.set(id, file);
        }
      });
      // Return a placeholder that will be updated when data arrives
      const placeholderFileData: FileData = { id, path: "", type: "unknown" };
      file = new ServerFile({ fileData: placeholderFileData, project: this });
      this._files.set(id, file);
    }
    return file;
  }

  private async _fetchFileData(fileId: string): Promise<FileData | null> {
    try {
      return await elementaAPI.getFile(this.id, fileId);
    } catch (error) {
      console.error(`Error fetching file data for ${fileId}:`, error);
      return null;
    }
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
    return this._getOrCreateFileAtPathSubject(path).getValue();
  }

  fileAtPath$(path: string): Observable<File | undefined> {
    return this._getOrCreateFileAtPathSubject(path).asObservable();
  }

  private _getOrCreateFileAtPathSubject(
    path: string
  ): BehaviorSubject<File | undefined> {
    let subject = this._fileAtPathSubjects.get(path);
    if (subject) {
      return subject;
    }

    subject = new BehaviorSubject<File | undefined>(undefined);
    this._fileAtPathSubjects.set(path, subject);

    this._fetchFileAtPath(path, subject);

    return subject;
  }

  private async _fetchFileAtPath(
    path: string,
    subject: BehaviorSubject<File | undefined>
  ) {
    try {
      const fileData = await elementaAPI.getFileByPath(this.id, path);
      let file = this._files.get(fileData.id);
      if (!file) {
        file = new ServerFile({ fileData, project: this });
        this._files.set(fileData.id, file);
      }
      subject.next(file);
    } catch (error) {
      console.error(`Error fetching file at path ${path}:`, error);
      subject.next(undefined);
    }
  }

  async getFiles(pathPrefix?: string, depth?: number): Promise<FileData[]> {
    const cacheKey = `${pathPrefix || ""}:${depth || ""}`;
    if (this._filesCache.has(cacheKey)) {
      return this._filesCache.get(cacheKey)!;
    }

    try {
      const files = await elementaAPI.getFiles(this.id, pathPrefix, depth);
      this._filesCache.set(cacheKey, files);
      return files;
    } catch (error) {
      console.error(`Error fetching files for project ${this.id}:`, error);
      return [];
    }
  }

  content(fileId: string): Content<File> {
    let content = this._content.get(fileId);
    if (!content) {
      const file = this._files.get(fileId) as ServerFile;
      if (!file) {
        throw new Error(`File ${fileId} not found`);
      }
      content = new ServerFileContent({ file });
      this._content.set(fileId, content);
    }
    return content;
  }

  installPackages(): Promise<PackageData[]> {
    throw new Error("Package installation not supported for server projects");
  }
}

export class ElementaServerInfrasture extends Infrastructure {
  private _projects: Map<string, ServerProject> = new Map();
  private _projectsCache: ProjectData[] | null = null;

  async getProjects(): Promise<ProjectData[]> {
    if (this._projectsCache) {
      return this._projectsCache;
    }

    try {
      this._projectsCache = await elementaAPI.getProjects();
      return this._projectsCache;
    } catch (error) {
      console.error("Error fetching projects:", error);
      return [];
    }
  }

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

export const infrastructure = new ElementaServerInfrasture();
