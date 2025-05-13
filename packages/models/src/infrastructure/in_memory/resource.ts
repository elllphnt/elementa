import { BehaviorSubject, Observable } from "rxjs";
import { AsyncResource, ResourceStatus } from "../interfaces/resource.js";

export abstract class InMemoryResource implements AsyncResource {
  readonly id: string;

  protected _status = new BehaviorSubject<ResourceStatus>(
    ResourceStatus.Pending
  );
  protected _error = new BehaviorSubject<Error | undefined>(undefined);

  get status$(): Observable<ResourceStatus> {
    return this._status.asObservable();
  }

  get status(): ResourceStatus {
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
        subscriber.next(status === ResourceStatus.Pending);
      });
      return () => subscription.unsubscribe();
    });
  }

  get isPending(): boolean {
    return this.status === ResourceStatus.Pending;
  }

  get isRetrieved$(): Observable<boolean> {
    return new Observable<boolean>((subscriber) => {
      const subscription = this._status.subscribe((status) => {
        subscriber.next(status !== ResourceStatus.Pending);
      });
      return () => subscription.unsubscribe();
    });
  }

  get isRetrieved(): boolean {
    return this.status !== ResourceStatus.Pending;
  }

  get isMissing$(): Observable<boolean> {
    return new Observable<boolean>((subscriber) => {
      const subscription = this._status.subscribe((status) => {
        subscriber.next(status === ResourceStatus.Missing);
      });
      return () => subscription.unsubscribe();
    });
  }

  get isMissing(): boolean {
    return this.status === ResourceStatus.Missing;
  }

  get isErrored$(): Observable<boolean> {
    return new Observable<boolean>((subscriber) => {
      const subscription = this._status.subscribe((status) => {
        subscriber.next(status === ResourceStatus.Errored);
      });
      return () => subscription.unsubscribe();
    });
  }

  get isErrored(): boolean {
    return this.status === ResourceStatus.Errored;
  }

  get isResolved$(): Observable<boolean> {
    return new Observable<boolean>((subscriber) => {
      const subscription = this._status.subscribe((status) => {
        subscriber.next(status === ResourceStatus.Resolved);
      });
      return () => subscription.unsubscribe();
    });
  }

  get isResolved(): boolean {
    return this.status === ResourceStatus.Resolved;
  }

  constructor({ id, status }: { id: string; status?: ResourceStatus }) {
    this.id = id;
    this._status.next(status ?? ResourceStatus.Pending);
  }

  markResolved(): void {
    this._status.next(ResourceStatus.Resolved);
    this._error.next(undefined);
  }

  markMissing(): void {
    this._status.next(ResourceStatus.Missing);
    this._error.next(undefined);
  }

  markError(error: Error): void {
    this._status.next(ResourceStatus.Errored);
    this._error.next(error);
  }
}
