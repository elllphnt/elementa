import {
  BehaviorSubject,
  filter,
  firstValueFrom,
  map,
  Observable,
  take,
  tap,
  timeout,
} from "rxjs";
import { AsyncResource, AsyncResourceStatus } from "../interfaces/resource.js";

export abstract class InMemoryResource implements AsyncResource {
  readonly id: string;

  protected _status = new BehaviorSubject<AsyncResourceStatus>(
    AsyncResourceStatus.Pending
  );
  protected _error = new BehaviorSubject<Error | undefined>(undefined);

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
    return new Observable<boolean>((subscriber) => {
      const subscription = this._status.subscribe((status) => {
        subscriber.next(status === AsyncResourceStatus.Pending);
      });
      return () => subscription.unsubscribe();
    });
  }

  get isPending(): boolean {
    return this.status === AsyncResourceStatus.Pending;
  }

  get isRetrieved$(): Observable<boolean> {
    return new Observable<boolean>((subscriber) => {
      const subscription = this._status.subscribe((status) => {
        subscriber.next(status !== AsyncResourceStatus.Pending);
      });
      return () => subscription.unsubscribe();
    });
  }

  get isRetrieved(): boolean {
    return this.status !== AsyncResourceStatus.Pending;
  }

  get isMissing$(): Observable<boolean> {
    return new Observable<boolean>((subscriber) => {
      const subscription = this._status.subscribe((status) => {
        subscriber.next(status === AsyncResourceStatus.Missing);
      });
      return () => subscription.unsubscribe();
    });
  }

  get isMissing(): boolean {
    return this.status === AsyncResourceStatus.Missing;
  }

  get isErrored$(): Observable<boolean> {
    return new Observable<boolean>((subscriber) => {
      const subscription = this._status.subscribe((status) => {
        subscriber.next(status === AsyncResourceStatus.Errored);
      });
      return () => subscription.unsubscribe();
    });
  }

  get isErrored(): boolean {
    return this.status === AsyncResourceStatus.Errored;
  }

  get isResolved$(): Observable<boolean> {
    return new Observable<boolean>((subscriber) => {
      const subscription = this._status.subscribe((status) => {
        subscriber.next(status === AsyncResourceStatus.Resolved);
      });
      return () => subscription.unsubscribe();
    });
  }

  get isResolved(): boolean {
    return this.status === AsyncResourceStatus.Resolved;
  }

  constructor({ id, status }: { id: string; status?: AsyncResourceStatus }) {
    this.id = id;
    this._status.next(status ?? AsyncResourceStatus.Pending);
  }

  untilRetrieved(timeoutAfter: number = 10000): Promise<void> {
    return firstValueFrom(
      this.status$.pipe(
        filter((status) => status !== AsyncResourceStatus.Pending),
        tap((status) => {
          if (status === AsyncResourceStatus.Errored) {
            throw this.error;
          }
        }),
        take(1),
        timeout(timeoutAfter),
        map(() => void 0) // Convert to void
      )
    );
  }

  markResolved(): void {
    this._status.next(AsyncResourceStatus.Resolved);
    this._error.next(undefined);
  }

  markMissing(): void {
    this._status.next(AsyncResourceStatus.Missing);
    this._error.next(undefined);
  }

  markError(error: Error): void {
    this._status.next(AsyncResourceStatus.Errored);
    this._error.next(error);
  }
}
