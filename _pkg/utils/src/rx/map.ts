// utils.pkg/src/rx/reactive_map.ts

import { BehaviorSubject, Observable } from "rxjs";
import { Disposable } from "../core/disposable";
import { reconcileMap } from "../core/reconciliation";

export class ReactiveMap<T> extends Disposable {
  private readonly _items$: BehaviorSubject<Record<string, T>>;

  constructor(initial: Record<string, T> = {}) {
    super();
    this._items$ = new BehaviorSubject(initial);
    this.addDisposer(() => {
      this._items$.complete();
    });
  }

  /** Current snapshot of the map */
  get items(): Record<string, T> {
    return this._items$.value;
  }

  /** Observable stream of map changes */
  get items$(): Observable<Record<string, T>> {
    return this._items$.asObservable();
  }

  /** Replace the entire map */
  set(items: Record<string, T>): void {
    this._items$.next(items);
  }

  /** Set or overwrite a single key */
  setKey(key: string, item: T): void {
    this._items$.next({ ...this.items, [key]: item });
  }

  /** Remove a single key */
  removeKey(key: string): T | undefined {
    const { [key]: removed, ...rest } = this.items;
    this._items$.next(rest);
    return removed;
  }

  /** Clear all entries */
  clear(): T[] {
    const removed = [...Object.values(this.items)];
    this._items$.next({});
    return removed;
  }

  /**
   * Reconcile current map against a new sources map,
   * reusing existing entries, creating new ones, and disposing removed ones.
   */
  reconcile<S>({
    sources,
    create,
    dispose,
    reconcile,
  }: {
    sources: Record<string, S>;
    create: (data: S) => T;
    reconcile: (target: T, source: S) => void;
    dispose?: (item: T) => void;
  }): void {
    const updated = reconcileMap<S, T>({
      targets: this.items,
      sources,
      create,
      dispose,
      reconcile: (target, source) => reconcile(target, source),
    });
    this._items$.next(updated);
  }
}
