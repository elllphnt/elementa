import { Disposable } from "@elllphnt/elementa-utils";
import { BehaviorSubject, Observable, combineLatest, map } from "rxjs";
import { FileModelAdaptor } from "~/models/_.js";
import { File } from "../../interfaces/file/file.js";
import { AsyncResourceStatus } from "../../interfaces/resource.js";

export abstract class InMemoryFileModelAdaptor<M>
  extends Disposable
  implements FileModelAdaptor<M>
{
  readonly file: File;

  private _model = new BehaviorSubject<M | undefined>(undefined);
  private _error = new BehaviorSubject<Error | undefined>(undefined);
  private _status = new BehaviorSubject<AsyncResourceStatus>(
    AsyncResourceStatus.Pending
  );

  constructor({ file }: { file: File }) {
    super();
    this.file = file;

    // Connect file status with our status
    combineLatest([file.status$, file.error$]).subscribe(
      ([fileStatus, fileError]) => {
        // If file has an error, propagate it
        if (fileError && !this._error.value) {
          this._error.next(fileError);
        }

        // Update our status based on file status
        if (fileStatus === AsyncResourceStatus.Errored) {
          this._status.next(AsyncResourceStatus.Errored);
        } else if (fileStatus === AsyncResourceStatus.Missing) {
          this._status.next(AsyncResourceStatus.Missing);
        }
        // Other status changes might be handled by derived classes
      }
    );

    this.addDisposer(() => {
      this._model.complete();
      this._error.complete();
      this._status.complete();
    });
  }

  get model(): M | undefined {
    return this._model.getValue();
  }

  get model$(): Observable<M | undefined> {
    return this._model.asObservable();
  }

  // AsyncResource implementation
  get status$(): Observable<AsyncResourceStatus> {
    return this._status.asObservable();
  }

  get status(): AsyncResourceStatus {
    return this._status.getValue();
  }

  get error$(): Observable<Error | undefined> {
    return this._error.asObservable();
  }

  get error(): Error | undefined {
    return this._error.getValue();
  }

  get isPending$(): Observable<boolean> {
    return this.status$.pipe(
      map((status) => status === AsyncResourceStatus.Pending)
    );
  }

  get isPending(): boolean {
    return this.status === AsyncResourceStatus.Pending;
  }

  get isMissing$(): Observable<boolean> {
    return this.status$.pipe(
      map((status) => status === AsyncResourceStatus.Missing)
    );
  }

  get isMissing(): boolean {
    return this.status === AsyncResourceStatus.Missing;
  }

  get isErrored$(): Observable<boolean> {
    return this.status$.pipe(
      map((status) => status === AsyncResourceStatus.Errored)
    );
  }

  get isErrored(): boolean {
    return this.status === AsyncResourceStatus.Errored;
  }

  get isResolved$(): Observable<boolean> {
    return this.status$.pipe(
      map((status) => status === AsyncResourceStatus.Resolved)
    );
  }

  get isResolved(): boolean {
    return this.status === AsyncResourceStatus.Resolved;
  }

  protected setModel(model: M | undefined): void {
    this._model.next(model);
    if (model !== undefined) {
      this._status.next(AsyncResourceStatus.Resolved);
    }
  }

  protected setError(error: Error): void {
    this._error.next(error);
    this._status.next(AsyncResourceStatus.Errored);
  }
}
