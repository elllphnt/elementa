import { PackageData } from "@elllphnt/elementa-base";
import {
  AsyncResourceStatus,
  Content,
  File,
  FileModelAdaptor,
  FileModelInterface,
  FileModelType,
  fileModelTypes,
  Infrastructure,
  Project,
} from "@elllphnt/elementa-core";
import { combineLatestOrEmpty } from "@elllphnt/elementa-utils";
import { combineLatest, map, Observable, of } from "rxjs";
import {
  StatefulApp,
  StatefulComponent,
  StatefulKeyframeSheet,
  StatefulPackageSheet,
  StatefulRouter,
  StatefulStyleModifierSheet,
  StatefulStylesheet,
  StatefulStyleSystem,
  StatefulStyleVariableSheet,
  StatefulTypefaceSheet,
} from "~/models/_.js";

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

  get textContent(): string {
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
    return this.file.textContent;
  }
  get text$(): Observable<string> {
    return of(this.file.textContent);
  }

  constructor({ file }: { file: InMemoryFile }) {
    super({ file });
    this.setStatus(AsyncResourceStatus.Resolved);
  }
}

export class InMemoryFileModelAdaptor<
  T extends FileModelType = FileModelType
> extends FileModelAdaptor<T, InMemoryFile> {
  private Stateful_: FileModelInterface<T>;

  get model(): FileModelInterface<T> {
    return this.Stateful_;
  }
  get model$(): Observable<FileModelInterface<T>> {
    return of(this.Stateful_);
  }

  constructor({ file, modelType }: { file: InMemoryFile; modelType: T }) {
    super({ file, modelType });

    const content = this.file.textContent;
    const init = content ? JSON.parse(content) : undefined;

    switch (modelType) {
      case fileModelTypes.app:
        this.Stateful_ = new StatefulApp({
          init,
          file,
        }) as unknown as FileModelInterface<T>;
        break;
      case fileModelTypes.component:
        this.Stateful_ = new StatefulComponent({
          init,
          file,
        }) as unknown as FileModelInterface<T>;
        break;
      case fileModelTypes.keyframeSheet:
        this.Stateful_ = new StatefulKeyframeSheet({
          init,
          file,
        }) as unknown as FileModelInterface<T>;
        break;
      case fileModelTypes.packageSheet:
        this.Stateful_ = new StatefulPackageSheet({
          init,
          file,
        }) as unknown as FileModelInterface<T>;
        break;
      case fileModelTypes.router:
        this.Stateful_ = new StatefulRouter({
          init,
          file,
        }) as unknown as FileModelInterface<T>;
        break;
      case fileModelTypes.styleModifierSheet:
        this.Stateful_ = new StatefulStyleModifierSheet({
          init,
          file,
        }) as unknown as FileModelInterface<T>;
        break;
      case fileModelTypes.styleSystem:
        this.Stateful_ = new StatefulStyleSystem({
          init,
          file,
        }) as unknown as FileModelInterface<T>;
        break;
      case fileModelTypes.styleVariableSheet:
        this.Stateful_ = new StatefulStyleVariableSheet({
          init,
          file,
        }) as unknown as FileModelInterface<T>;
        break;
      case fileModelTypes.stylesheet:
        this.Stateful_ = new StatefulStylesheet({
          init,
          file,
        }) as unknown as FileModelInterface<T>;
        break;
      case fileModelTypes.typefaceSheet:
        this.Stateful_ = new StatefulTypefaceSheet({
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
  private _installPackages?: (
    packages: Array<Pick<PackageData, "name"> & Partial<PackageData>>
  ) => Promise<PackageData[]>;

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
    installPackages,
  }: {
    data: InMemoryProjectData;
    infrastructure: Infrastructure;
    installPackages?: (
      packages: Array<Pick<PackageData, "name"> & Partial<PackageData>>
    ) => Promise<PackageData[]>;
  }) {
    super({ id: data.id, infrastructure });
    this._files = new Map(
      data.files.map((data) => [
        data.id,
        new InMemoryFile({ data, project: this }),
      ])
    );
    this._installPackages = installPackages;
  }

  installPackages(
    packages: Array<Pick<PackageData, "name"> & Partial<PackageData>>
  ): Promise<PackageData[]> {
    if (this._installPackages) {
      return this._installPackages(packages);
    } else {
      throw Error(`Method not implemented`);
    }
  }
}
