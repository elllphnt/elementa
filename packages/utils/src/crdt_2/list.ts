import { BehaviorSubject, Observable } from "rxjs";
import * as y from "yjs";

export class CrdtListState<T> {
  private readonly list: y.Array<T>;
  private readonly subject$: BehaviorSubject<T[]>;

  constructor(list: y.Array<T>) {
    this.list = list;

    // Initialize subject with current value
    const initial = list.doc ? list.toArray() : [];
    this.subject$ = new BehaviorSubject<T[]>(initial);

    // Observe CRDT changes
    this.observer = this.observer.bind(this);
    this.list.observe(this.observer);
  }

  private observer() {
    this.subject$.next(this.list.toArray());
  }

  get items(): T[] {
    return this.subject$.value;
  }

  get items$(): Observable<T[]> {
    return this.subject$.asObservable();
  }

  add(item: T): void {
    this.list.push([item]);
  }

  append(items: T[]): void {
    this.list.push(items);
  }

  prepend(items: T[]): void {
    this.list.insert(0, items);
  }

  insertAt(index: number, items: T[]): void {
    this.list.insert(index, items);
  }

  remove(predicate: (item: T) => boolean): T[] {
    const snapshot = this.list.toArray();
    const removed: T[] = [];

    for (let i = snapshot.length - 1; i >= 0; i--) {
      if (predicate(snapshot[i])) {
        this.list.delete(i);
        removed.push(snapshot[i]);
      }
    }

    return removed;
  }

  removeAt(index: number, count: number = 1): T[] {
    const removed = this.list.toArray().slice(index, index + count);
    this.list.delete(index, count);
    return removed;
  }

  setItems(items: T[]): void {
    this.list.delete(0, this.list.length);
    this.list.push(items);
  }

  clear(): T[] {
    const removed = [...this.items];
    this.list.delete(0, this.list.length);
    return removed;
  }

  dispose(): void {
    this.list.unobserve(this.observer);
    this.subject$.complete();
  }
}
