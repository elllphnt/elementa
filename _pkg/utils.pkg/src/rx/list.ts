import { BehaviorSubject, Observable } from "rxjs";
import { Disposable } from "../core/disposable";
import { reconcileList } from "../core/reconciliation";

export class ReactiveList<T> extends Disposable {
  private readonly _items$: BehaviorSubject<T[]>;

  /** Current snapshot of the list */
  get items(): T[] {
    return this._items$.value;
  }

  /** Observable stream of list changes */
  get items$(): Observable<T[]> {
    return this._items$.asObservable();
  }

  constructor(initial: T[] = []) {
    super();

    this._items$ = new BehaviorSubject(initial);

    this.addDisposer(() => {
      this._items$.complete();
    });
  }

  /** Replace the entire list */
  set(items: T[]): void {
    this._items$.next(items);
  }

  /** Add one item at the end */
  add(item: T): void {
    this._items$.next([...this.items, item]);
  }

  /** Insert at a given index */
  insertAt(index: number, item: T): void {
    const arr = this.items.slice();
    arr.splice(index, 0, item);
    this._items$.next(arr);
  }

  /** Remove items matching a predicate */
  remove(predicate: (item: T) => boolean): T[] {
    const removed: T[] = [];
    this._items$.next(
      this.items.filter((i) => {
        if (predicate(i)) {
          removed.push(i);
          return false;
        }
        return true;
      }),
    );

    return removed;
  }

  /** Clear everything */
  clear(): T[] {
    const removed = [...this.items];
    this._items$.next([]);
    return removed;
  }

  /**
   * Reconcile current list against a new array of `sources`,
   * reusing, creating, or disposing items via your `reconcileList` primitive.
   */
  reconcile<S, R>({
    sources,
    sourceRef,
    targetRef,
    create,
    dispose,
    reconcile,
  }: {
    sources: S[];
    sourceRef: (source: S) => R;
    targetRef: (target: T) => R;
    create: (source: S) => T;
    reconcile: (target: T, source: S) => void;
    dispose?: (target: T) => void;
  }): void {
    const updated = reconcileList<S, T, R>({
      targets: this.items,
      sources,
      targetRef,
      sourceRef,
      create,
      dispose,
      reconcile,
    });
    this._items$.next(updated);
  }
}
