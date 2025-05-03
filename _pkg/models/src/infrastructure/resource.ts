import { Disposable } from "@elllphnt/elementa-utils";
import { BehaviorSubject, map, Observable } from "rxjs";

export enum ResourceStatus {
  Pending,
  Missing,
  Errored,
  Resolved,
}

export abstract class Resource extends Disposable {
  abstract get url(): string;

  private _status$ = new BehaviorSubject<ResourceStatus>(
    ResourceStatus.Pending
  );
  private _error$ = new BehaviorSubject<Error | undefined>(undefined);

  readonly status$: Observable<ResourceStatus> = this._status$.asObservable();
  get status(): ResourceStatus {
    return this._status$.value;
  }

  readonly error$: Observable<Error | undefined> = this._error$.asObservable();
  get error(): Error | undefined {
    return this._error$.value;
  }

  isPending$: Observable<boolean> = this.status$.pipe(
    map((status) => status === ResourceStatus.Pending)
  );
  get isPending(): boolean {
    return this.status === ResourceStatus.Pending;
  }

  isFetched$: Observable<boolean> = this.status$.pipe(
    map((status) => status !== ResourceStatus.Pending)
  );
  get isFetched(): boolean {
    return this.status !== ResourceStatus.Pending;
  }

  isMissing$: Observable<boolean> = this.status$.pipe(
    map((status) => status === ResourceStatus.Missing)
  );
  get isMissing(): boolean {
    return this.status === ResourceStatus.Missing;
  }

  isErrored$: Observable<boolean> = this.status$.pipe(
    map((status) => status === ResourceStatus.Errored)
  );
  get isErrored(): boolean {
    return this.status === ResourceStatus.Errored;
  }

  isResolved$: Observable<boolean> = this.status$.pipe(
    map((status) => status === ResourceStatus.Resolved)
  );
  get isResolved(): boolean {
    return this.status === ResourceStatus.Resolved;
  }

  protected setStatus(status: ResourceStatus): void {
    this._status$.next(status);
  }
  protected setError(error: Error | undefined): void {
    this._error$.next(error);
  }

  abstract load(): Promise<void>;
}
