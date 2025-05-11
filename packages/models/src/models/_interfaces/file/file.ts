import { Disposable } from "@elllphnt/elementa-utils";
import { Observable } from "rxjs";

export abstract class FileModel<M> extends Disposable {
  readonly file: File;

  abstract get model(): M | undefined;
  abstract get model$(): Observable<M | undefined>;

  constructor({ file }: { file: File }) {
    super();
    this.file = file;
  }
}
