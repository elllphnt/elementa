import { Observable } from "rxjs";

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
export interface AsyncResource {
  status$: Observable<AsyncResourceStatus>;
  status: AsyncResourceStatus;

  error$: Observable<Error | undefined>;
  error: Error | undefined;

  isPending$: Observable<boolean>;
  isPending: boolean;

  isMissing$: Observable<boolean>;
  isMissing: boolean;

  isErrored$: Observable<boolean>;
  isErrored: boolean;

  isResolved$: Observable<boolean>;
  isResolved: boolean;

  isRetrieved$: Observable<boolean>;
  isRetrieved: boolean;

  untilRetrieved(timeout?: number): Promise<void>;
}
