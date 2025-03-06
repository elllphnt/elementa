import { BehaviorSubject, distinctUntilChanged, map } from "rxjs";

export class Registry<K, V> {
  protected _items$ = new BehaviorSubject(new Map<K, V>());

  item(key: K | undefined) {
    if (!key) {
      return undefined;
    }
    return this._items$.value.get(key);
  }
  item$(key: K | undefined) {
    return this._items$.pipe(
      map((items) => {
        if (!key) {
          return undefined;
        }
        return items.get(key);
      }),
      distinctUntilChanged()
    );
  }

  items() {
    return [...this._items$.value.values()];
  }
  items$() {
    return this._items$.pipe(
      map((items) => [...items.values()]),
      distinctUntilChanged(
        (prev, curr) =>
          prev.length === curr.length && prev.every((v, i) => v === curr[i])
      )
    );
  }

  constructor(init?: [K, V][]) {
    if (init) {
      this.setMany(init);
    }
  }

  set(key: K, value: V) {
    const newItems = new Map(this._items$.value);
    newItems.set(key, value);
    this._items$.next(newItems);
  }
  delete(key: K) {
    const newItems = new Map(this._items$.value);
    newItems.delete(key);
    this._items$.next(newItems);
  }

  setMany(entries: [K, V][]) {
    const newItems = new Map(this._items$.value);
    for (const [key, value] of entries) {
      newItems.set(key, value);
    }
    this._items$.next(newItems);
  }
  deleteMany(keys: K[]) {
    const newItems = new Map(this._items$.value);
    for (const key of keys) {
      newItems.delete(key);
    }
    this._items$.next(newItems);
  }

  clear() {
    this._items$.next(new Map());
  }
}
export class Collection<K, T extends {}> extends Registry<K, T> {
  protected _resolveKey: (value: T) => K;

  static IdResolver = (value: { id: any }) => value.id;
  static KeyResolver = (value: { key: any }) => value.key;

  constructor(resolveKey: (value: T) => K) {
    super();
    this._resolveKey = resolveKey;
  }

  add(item: T) {
    this.set(this._resolveKey(item), item);
  }
  addMany(items: T[]) {
    if (items.length === 0) return;
    this.setMany(items.map((item) => [this._resolveKey(item), item]));
  }
}
