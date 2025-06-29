import { BehaviorSubject, Observable } from "rxjs";
import { ListState } from "../../list.js";

export class JsonListState<T> extends ListState<T> {
  private readonly subject$: BehaviorSubject<T[]>;

  constructor(init: T[] = []) {
    super();
    this.subject$ = new BehaviorSubject<T[]>([...init]);

    this.addDisposer(() => {
      this.subject$.complete();
    });
  }

  get items(): T[] {
    return this.subject$.value;
  }

  get items$(): Observable<T[]> {
    return this.subject$.asObservable();
  }

  add(item: T): void {
    const current = [...this.subject$.value];
    current.push(item);
    this.subject$.next(current);
  }

  append(items: T[]): void {
    const current = [...this.subject$.value];
    current.push(...items);
    this.subject$.next(current);
  }

  prepend(items: T[]): void {
    const current = [...this.subject$.value];
    current.unshift(...items);
    this.subject$.next(current);
  }

  insertAt(index: number, items: T[]): void {
    const current = [...this.subject$.value];
    current.splice(index, 0, ...items);
    this.subject$.next(current);
  }

  remove(predicate: (item: T) => boolean): T[] {
    const current = [...this.subject$.value];
    const removed: T[] = [];

    for (let i = current.length - 1; i >= 0; i--) {
      if (predicate(current[i])) {
        removed.push(current[i]);
        current.splice(i, 1);
      }
    }

    this.subject$.next(current);
    return removed.reverse(); // Restore original order
  }

  removeAt(index: number, count: number = 1): T[] {
    const current = [...this.subject$.value];
    const removed = current.splice(index, count);
    this.subject$.next(current);
    return removed;
  }

  setItems(items: T[]): void {
    this.subject$.next([...items]);
  }

  clear(): T[] {
    const removed = [...this.items];
    this.subject$.next([]);
    return removed;
  }
}
