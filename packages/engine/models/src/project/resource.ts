import { Lifecycle } from "@elllphnt/elementa-kernel";
import { BehaviorSubject, filter, firstValueFrom, map, timeout } from "rxjs";

/**
 * Represents the different states of an asynchronous resource.
 *
 * @enum {number}
 */
export enum AsyncResourceStatus {
  /** Resource is currently loading or being processed */
  Pending,
  /** Resource was not found or does not exist */
  Missing,
  /** An error occurred while processing the resource */
  Errored,
  /** Resource was successfully loaded and is ready for use */
  Resolved,
}

/**
 * Interface representing an asynchronous resource with observable status properties.
 * Provides reactive properties to monitor the resource's state throughout its lifecycle.
 */
export abstract class AsyncResource extends Lifecycle {
  static timeoutDuration = 5000;

  private _status$ = new BehaviorSubject<{
    status: AsyncResourceStatus;
    error?: Error;
  }>({
    status: AsyncResourceStatus.Pending,
    error: undefined,
  });

  status$ = this._status$.asObservable().pipe(map((state) => state.status));
  get status() {
    return this._status$.value.status;
  }

  error$ = this._status$.asObservable().pipe(map((state) => state.error));
  get error() {
    return this._status$.value.error;
  }

  isPending$ = this.status$.pipe(
    map((status) => status === AsyncResourceStatus.Pending)
  );
  get isPending() {
    return this.status === AsyncResourceStatus.Pending;
  }

  isMissing$ = this.status$.pipe(
    map((status) => status === AsyncResourceStatus.Missing)
  );
  get isMissing() {
    return this.status === AsyncResourceStatus.Missing;
  }

  isErrored$ = this.status$.pipe(
    map((status) => status === AsyncResourceStatus.Errored)
  );
  get isErrored() {
    return this.status === AsyncResourceStatus.Errored;
  }

  isResolved$ = this.status$.pipe(
    map((status) => status === AsyncResourceStatus.Resolved)
  );
  get isResolved() {
    return this.status === AsyncResourceStatus.Resolved;
  }

  isRetrieved$ = this.status$.pipe(
    map(
      (status) =>
        status === AsyncResourceStatus.Resolved ||
        status === AsyncResourceStatus.Missing
    )
  );
  get isRetrieved() {
    return (
      this.status === AsyncResourceStatus.Resolved ||
      this.status === AsyncResourceStatus.Missing
    );
  }

  constructor() {
    super();
    this.addDisposer(() => {
      this._status$.complete();
    });
  }

  untilRetrieved(timeoutDuration?: number) {
    const _timeoutDuration = timeoutDuration || AsyncResource.timeoutDuration;
    return firstValueFrom(
      this.isRetrieved$.pipe(filter(Boolean), timeout(_timeoutDuration))
    );
  }

  setStatus(status: AsyncResourceStatus, error?: Error): AsyncResource {
    this._status$.next({ status, error });
    return this;
  }
}
