import { combineLatestOrEmpty } from "@elllphnt/elementa-utils";
import { combineLatest, map, Observable, of } from "rxjs";
import { Infrastructure } from "~/infrastructure/_.js";
import {
  ComponentModel,
  KeyframeSheetModel,
  PackageSheetModel,
  RouterModel,
  StyleModifierSheetModel,
  StylesheetModel,
  StyleSystemModel,
  StyleVariableSheetModel,
  TypefaceSheetModel,
} from "~/models/_.js";
import { AppModel } from "~/models/_implementations/stateful/app/app.js";
import {
  Content,
  File,
  FileModelAdaptor,
  FileModelInterface,
  FileModelType,
  fileModelTypes,
} from "../file/_.js";
import { Project } from "../project.js";
import { AsyncResourceStatus } from "../resource.js";

export type InMemoryFileData = {
  id: string;
  path: string;
  content: string;
};
export type InMemoryProjectData = {
  id: string;
  files: InMemoryFileData[];
};
export class InMemoryFile extends File {
  private _data: InMemoryFileData;

  get path(): string {
    return this._data.path;
  }
  get path$(): Observable<string> {
    return of(this._data.path);
  }

  get content(): string {
    return this._data.content;
  }

  constructor({ data, project }: { data: InMemoryFileData; project: Project }) {
    super({ id: data.id, project });
    this._data = data;
    this.setStatus(AsyncResourceStatus.Resolved);
  }
}
export class InMemoryContent extends Content<InMemoryFile> {
  get text(): string {
    return this.file.content;
  }
  get text$(): Observable<string> {
    return of(this.file.content);
  }

  constructor({ file }: { file: InMemoryFile }) {
    super({ file });
    this.setStatus(AsyncResourceStatus.Resolved);
  }
}

export class InMemoryFileModelAdaptor<
  T extends FileModelType = FileModelType
> extends FileModelAdaptor<T, InMemoryFile> {
  private _model: FileModelInterface<T>;

  get model(): FileModelInterface<T> {
    return this._model;
  }
  get model$(): Observable<FileModelInterface<T>> {
    return of(this._model);
  }

  constructor({ file, modelType }: { file: InMemoryFile; modelType: T }) {
    super({ file, modelType });

    const content = this.file.content;
    const init = content ? JSON.parse(content) : undefined;

    switch (modelType) {
      case fileModelTypes.app:
        this._model = new AppModel({
          init,
          file,
        }) as unknown as FileModelInterface<T>;
        break;
      case fileModelTypes.component:
        this._model = new ComponentModel({
          init,
          file,
        }) as unknown as FileModelInterface<T>;
        break;
      case fileModelTypes.keyframeSheet:
        this._model = new KeyframeSheetModel({
          init,
          file,
        }) as unknown as FileModelInterface<T>;
        break;
      case fileModelTypes.packageSheet:
        this._model = new PackageSheetModel({
          init,
          file,
        }) as unknown as FileModelInterface<T>;
        break;
      case fileModelTypes.router:
        this._model = new RouterModel({
          init,
          file,
        }) as unknown as FileModelInterface<T>;
        break;
      case fileModelTypes.styleModifierSheet:
        this._model = new StyleModifierSheetModel({
          init,
          file,
        }) as unknown as FileModelInterface<T>;
        break;
      case fileModelTypes.styleSystem:
        this._model = new StyleSystemModel({
          init,
          file,
        }) as unknown as FileModelInterface<T>;
        break;
      case fileModelTypes.styleVariableSheet:
        this._model = new StyleVariableSheetModel({
          init,
          file,
        }) as unknown as FileModelInterface<T>;
        break;
      case fileModelTypes.stylesheet:
        this._model = new StylesheetModel({
          init,
          file,
        }) as unknown as FileModelInterface<T>;
        break;
      case fileModelTypes.typefaceSheet:
        this._model = new TypefaceSheetModel({
          init,
          file,
        }) as unknown as FileModelInterface<T>;
        break;
    }

    this.setStatus(AsyncResourceStatus.Resolved);
  }
}

export function fileModelAdaptorKey(modelType: string, fileId: string) {
  return `${modelType}:${fileId}`;
}

export class InMemoryProject extends Project<InMemoryFile> {
  private _files = new Map<string, InMemoryFile>();
  private _contents = new Map<string, InMemoryContent>();
  private _fileModelAdaptors = new Map<string, InMemoryFileModelAdaptor>();

  file(id: string): InMemoryFile {
    const file = this._files.get(id);
    if (!file) throw Error(`File ${id} not found.`);
    return file;
  }
  fileModelAdaptor<T extends FileModelType>(
    modelType: T,
    fileId: string
  ): FileModelAdaptor<T, InMemoryFile> {
    const key = fileModelAdaptorKey(modelType, fileId);
    let adaptor = this._fileModelAdaptors.get(
      key
    ) as InMemoryFileModelAdaptor<T>;
    if (!adaptor) {
      adaptor = new InMemoryFileModelAdaptor<T>({
        modelType,
        file: this.file(fileId),
      });
    }
    return adaptor;
  }
  content(fileId: string): Content<InMemoryFile> {
    let content = this._contents.get(fileId);
    if (!content) {
      content = new InMemoryContent({ file: this.file(fileId) });
    }
    return content;
  }
  fileAtPath(path: string): File | undefined {
    return [...this._files.values()].find((file) => file.path === path);
  }
  fileAtPath$(path: string): Observable<File | undefined> {
    return combineLatestOrEmpty(
      [...this._files.values()].map((file) =>
        combineLatest({
          file: of(file),
          path: file.path$,
        })
      )
    ).pipe(
      map((files) => files.find((f) => f.path === path)),
      map((f) => f?.file)
    );
  }

  constructor({
    data,
    infrastructure,
  }: {
    data: InMemoryProjectData;
    infrastructure: Infrastructure;
  }) {
    super({ id: data.id, infrastructure });
    this._files = new Map(
      data.files.map((data) => [
        data.id,
        new InMemoryFile({ data, project: this }),
      ])
    );
  }
}
