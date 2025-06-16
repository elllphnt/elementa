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

export class LibraryFileModelAdaptor<
  T extends FileModelType
> extends StatefulFileModelAdaptor<T, LibraryFile> {
  private _data$ = new BehaviorSubject<any>(undefined);

  get data(): any {
    return this._data$.getValue();
  }
  get data$(): Observable<any> {
    return this._data$.asObservable();
  }

  constructor({ file, modelType }: { file: LibraryFile; modelType: T }) {
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
    // Note: This is read-only for the library viewer
    throw new Error("Library files are read-only");
  }
}

export class LibraryFileContent extends Content<LibraryFile> {
  private _text$ = new BehaviorSubject<string>("");

  get text(): string {
    return this._text$.getValue();
  }
  get text$(): Observable<string> {
    return this._text$.asObservable();
  }

  constructor({ file }: { file: LibraryFile }) {
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

export class LibraryFile extends File {
  static pathToId(filePath: string): string {
    return encodeURIComponent(filePath);
  }
  static idToPath(fileId: string): string {
    return decodeURIComponent(fileId);
  }

  private _path: string;
  textContentPromise: Promise<string>;

  get path(): string {
    return this._path;
  }
  get path$(): Observable<string> {
    return of(this._path);
  }

  get content() {
    return this.project.content(this.id);
  }

  constructor({ id, project }: { id: string; project: LibraryProject }) {
    super({ id, project });
    this._path = LibraryFile.idToPath(id);
    this.setStatus(AsyncResourceStatus.Resolved);
    this.textContentPromise = this._fetchContent();
  }

  private async _fetchContent(): Promise<string> {
    try {
      const filePath = this.path;
      const response = await fetch(
        `http://localhost:3001/api/file?path=${encodeURIComponent(filePath)}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch file content: ${response.statusText}`);
      }

      const data = await response.json();
      return data.content;
    } catch (error) {
      console.error(`Error fetching content for file ${this.id}:`, error);
      throw error;
    }
  }
}

export class LibraryProject extends Project {
  private _files: Map<string, LibraryFile> = new Map();
  private _fileModelAdaptors: Map<
    string,
    LibraryFileModelAdaptor<FileModelType>
  > = new Map();
  private _content: Map<string, LibraryFileContent> = new Map();
  private _fileAtPathSubjects: Map<string, BehaviorSubject<File | undefined>> =
    new Map();
  private _fileTree: any[] = [];
  private _fileTreeLoaded = false;

  file(id: string): File {
    let file = this._files.get(id);
    if (!file) {
      file = new LibraryFile({ id, project: this });
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
      adaptor = new LibraryFileModelAdaptor<T>({
        modelType,
        file: this.file(fileId) as LibraryFile,
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
      await this._ensureFileTreeLoaded();

      const fileExists = this._findFileInTree(this._fileTree, path);
      if (fileExists) {
        const fileId = path; // Use path as ID for library files
        let file = this._files.get(fileId);
        if (!file) {
          file = new LibraryFile({ id: fileId, project: this });
          this._files.set(fileId, file);
        }
        subject.next(file);
      } else {
        subject.next(undefined);
      }
    } catch (error) {
      console.error(`Error fetching file at path ${path}:`, error);
      subject.next(undefined);
    }
  }

  private async _ensureFileTreeLoaded(): Promise<void> {
    if (this._fileTreeLoaded) {
      return;
    }

    try {
      const response = await fetch("http://localhost:3001/api/filetree");
      if (!response.ok) {
        throw new Error("Failed to fetch file tree");
      }
      this._fileTree = await response.json();
      this._fileTreeLoaded = true;
    } catch (error) {
      console.error("Error loading file tree:", error);
      throw error;
    }
  }

  private _findFileInTree(tree: any[], targetPath: string): boolean {
    for (const item of tree) {
      if (item.type === "file" && item.path === targetPath) {
        return true;
      }
      if (item.type === "directory" && item.children) {
        if (this._findFileInTree(item.children, targetPath)) {
          return true;
        }
      }
    }
    return false;
  }

  content(fileId: string): Content<File> {
    let content = this._content.get(fileId);
    if (!content) {
      const file = this._files.get(fileId) as LibraryFile;
      if (!file) {
        throw new Error(`File ${fileId} not found`);
      }
      content = new LibraryFileContent({ file });
      this._content.set(fileId, content);
    }
    return content;
  }

  installPackages(): Promise<PackageData[]> {
    throw new Error("Package installation not supported for library projects");
  }
}

export class LibraryInfrastructure extends Infrastructure {
  private _project: LibraryProject;

  project(): LibraryProject {
    return this._project;
  }

  constructor() {
    super();
    this._project = new LibraryProject({
      id: "project",
      infrastructure: this,
    });
  }

  resolveStaticReference<T>(): Promise<T> {
    throw new Error("Method not implemented.");
  }
}
