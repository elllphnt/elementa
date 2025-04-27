import { BehaviorSubject, Observable } from "rxjs";
import * as y from "yjs";
import { Disposable } from "../core/disposable";

/**
 * A standalone modelization of a Yjs Array (`y.Array`) backed by a BehaviorSubject.
 * Can be used to store and manipulate CRDT-driven arrays with reactive updates.
 */
export class ListCRDTModel<T> extends Disposable {
  // Unique key for this model type
  static key = Math.round(Math.random() * 100000);
  key = ListCRDTModel.key++;

  readonly yarray: y.Array<T>;
  private readonly _state$ = new BehaviorSubject<T[]>([]);

  /**
   * Current array snapshot
   */
  get state(): T[] {
    return this._state$.value;
  }

  /**
   * Observable stream of array snapshots
   */
  get state$(): Observable<T[]> {
    return this._state$.asObservable();
  }

  constructor(yarray: y.Array<T>) {
    super();
    this.yarray = yarray;

    // Initialize with current array contents
    this._state$.next(this.yarray.toArray());

    // Observe array changes and emit new snapshots
    const observer = () => {
      this._state$.next(this.yarray.toArray());
    };
    this.yarray.observe(observer);

    // Clean up on dispose
    this.addDisposer(() => {
      this.yarray.unobserve(observer);
      this._state$.complete();
    });
  }

  /**
   * Perform multiple operations inside a transaction
   */
  transact(fn: () => void): void {
    const doc = this.yarray.doc;
    if (!doc) {
      throw new Error("Document is not initialized");
    }
    doc.transact(fn);
  }

  /**
   * Replace entire array contents
   */
  set(next: T[]): void {
    this.transact(() => {
      // Clear existing
      this.yarray.delete(0, this.yarray.length);
      // Insert new
      this.yarray.insert(0, next);
    });
  }

  /**
   * Patch by appending items
   */
  push(...items: T[]): void {
    this.transact(() => {
      this.yarray.push(items);
    });
  }

  /**
   * Insert items at the given index
   */
  insert(index: number, ...items: T[]): void {
    this.transact(() => {
      this.yarray.insert(index, items);
    });
  }

  /**
   * Delete `length` items starting at `index`
   */
  delete(index: number, length = 1): void {
    this.transact(() => {
      this.yarray.delete(index, length);
    });
  }

  /**
   * Clear all items
   */
  clear(): void {
    this.transact(() => {
      this.yarray.delete(0, this.yarray.length);
    });
  }

  /**
   * Get item at index
   */
  get(index: number): T | undefined {
    return this.yarray.get(index);
  }

  /**
   * Get current length
   */
  get length(): number {
    return this.yarray.length;
  }
}

/**
 * Utility type to extract the data type from an ArrayCRDTModel instance
 */
export type ListCRDTModelDataType<M> = M extends ListCRDTModel<infer D>
  ? D[]
  : never;
