import { map, Observable, of, switchMap } from "rxjs";
import { ModelAdaptor } from "~/_models/_.js";
import { File, FileReference } from "./file.js";
import { FileModelInterface, FileModelType } from "./file_types.js";

export abstract class FileModelAdaptor<
  T extends FileModelType,
  F extends File = File
> extends ModelAdaptor<FileModelInterface<T>> {
  readonly file: F;
  readonly modelType: string;

  constructor({ file, modelType }: { file: F; modelType: string }) {
    super();
    this.file = file;
    this.modelType = modelType;
  }
}

export class FileReferenceModelAdaptor<
  T extends FileModelType,
  F extends File = File
> extends ModelAdaptor<FileModelInterface<T>> {
  readonly fileReference: FileReference<F>;
  readonly modelType: T;

  get fileModelAdaptor$(): Observable<FileModelAdaptor<T, F> | undefined> {
    return this.fileReference.file$.pipe(
      map((file) => {
        if (!file) {
          return undefined;
        }
        return this.fileReference.project.fileModelAdaptor(
          this.modelType,
          file.id
        );
      })
    );
  }
  get fileModelAdaptor(): FileModelAdaptor<T, F> | undefined {
    const file = this.fileReference.file;
    return file
      ? this.fileReference.project.fileModelAdaptor(this.modelType, file.id)
      : undefined;
  }

  get model() {
    return this.fileModelAdaptor?.model;
  }
  get model$() {
    return this.fileModelAdaptor$.pipe(
      switchMap((adaptor) => adaptor?.model$ || of(undefined))
    );
  }

  constructor({
    modelType,
    fileReference,
  }: {
    modelType: T;
    fileReference: FileReference<F>;
  }) {
    super();
    this.fileReference = fileReference;
    this.modelType = modelType;
  }

  async initialize(): Promise<void> {
    this.setInitialized();
  }
}
