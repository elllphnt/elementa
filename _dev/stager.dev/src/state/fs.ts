import { BehaviorSubject, distinctUntilChanged, Subscription } from "rxjs";
import { FileType } from "./types";

export type FileData = {
  id: string;
  name: string;
  type: FileType;
};

export class File {
  id: string;
  private _name$ = new BehaviorSubject<string>("");
  private _type$ = new BehaviorSubject<FileType>("component");
  fileSystem: FileSystem;

  constructor({
    id,
    name = "",
    type = "component" as FileType,
    fileSystem,
  }: {
    id: string;
    name?: string;
    type?: FileType;
    fileSystem: FileSystem;
  }) {
    this.id = id;
    this.fileSystem = fileSystem;
    this._name$.next(name);
    this._type$.next(type);
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
    };
  }

  get name() {
    return this._name$.value;
  }

  get name$() {
    return this._name$.asObservable().pipe(distinctUntilChanged());
  }

  get type() {
    return this._type$.value;
  }

  get type$() {
    return this._type$.asObservable().pipe(distinctUntilChanged());
  }

  setName(name: string) {
    this._name$.next(name);
    this.fileSystem.notifyFileChanged();
  }

  setType(type: FileType) {
    this._type$.next(type);
    this.fileSystem.notifyFileChanged();
  }
}

export class FileSystem {
  private _files$ = new BehaviorSubject<Record<string, File>>({});
  private subscription: Subscription;

  storageKey = "stager.filesystem";

  constructor() {
    this.load();
    this.subscription = this._files$.subscribe(() => {
      this.save();
    });
  }

  get files() {
    return this._files$.value;
  }

  get files$() {
    return this._files$.asObservable();
  }

  load() {
    const content = localStorage.getItem(this.storageKey);
    if (content) {
      try {
        const data = JSON.parse(content);
        const fileRecord: Record<string, File> = {};
        for (const [id, fileData] of Object.entries(data)) {
          const { name, type } = fileData as FileData;
          fileRecord[id] = new File({ id, name, type, fileSystem: this });
        }
        this._files$.next(fileRecord);
      } catch (error) {
        console.error("Failed to load filesystem data:", error);
      }
    }
  }

  save() {
    // Convert File objects to plain objects for storage
    const serializedFiles: Record<string, FileData> = {};
    Object.entries(this.files).forEach(([id, file]) => {
      serializedFiles[id] = {
        id: file.id,
        name: file.name,
        type: file.type,
      };
    });

    localStorage.setItem(this.storageKey, JSON.stringify(serializedFiles));
  }

  getFile(id: string): File | undefined {
    return this.files[id];
  }

  notifyFileChanged() {
    this.save();
  }

  createFile(name: string, type: FileType): File {
    const id = crypto.randomUUID();
    const file = new File({ id, name, type, fileSystem: this });
    const updatedFiles = { ...this._files$.value, [id]: file };
    this._files$.next(updatedFiles);
    return file;
  }

  deleteFile(id: string) {
    const updatedFiles = { ...this._files$.value };
    delete updatedFiles[id];
    this._files$.next(updatedFiles);
  }

  // Clean up subscription when no longer needed
  dispose() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}

export const fileSystem = new FileSystem();
