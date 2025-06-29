import { BehaviorSubject, Observable } from "rxjs";
import { State } from "../../state.js";
import { AggregatedStateList } from "../../state_list.js";

export class AggregatedJsonStateList<
  S extends State
> extends AggregatedStateList<S> {
  private readonly subject$: BehaviorSubject<S[]>;
  private readonly createState: () => S;

  constructor(init: S[] = [], createState: () => S) {
    super();
    this.createState = createState;
    this.subject$ = new BehaviorSubject<S[]>([...init]);

    this.addDisposer(() => {
      this.subject$.complete();
      this.subject$.value.forEach((state) => state.dispose());
    });
  }

  get items(): S[] {
    return this.subject$.value;
  }

  get items$(): Observable<S[]> {
    return this.subject$.asObservable();
  }

  add(item: S): void {
    const current = [...this.subject$.value];
    current.push(item);
    this.subject$.next(current);
  }

  append(items: S[]): void {
    const current = [...this.subject$.value];
    current.push(...items);
    this.subject$.next(current);
  }

  prepend(items: S[]): void {
    const current = [...this.subject$.value];
    current.unshift(...items);
    this.subject$.next(current);
  }

  insertAt(index: number, items: S[]): void {
    const current = [...this.subject$.value];
    current.splice(index, 0, ...items);
    this.subject$.next(current);
  }

  remove(predicate: (item: S) => boolean): S[] {
    const current = [...this.subject$.value];
    const removed: S[] = [];

    for (let i = current.length - 1; i >= 0; i--) {
      if (predicate(current[i])) {
        removed.push(current[i]);
        current.splice(i, 1);
      }
    }

    this.subject$.next(current);
    return removed.reverse(); // Restore original order
  }

  removeAt(index: number, count: number = 1): S[] {
    const current = [...this.subject$.value];
    const removed = current.splice(index, count);
    this.subject$.next(current);
    return removed;
  }

  setItems(items: S[]): void {
    // Dispose old states
    this.subject$.value.forEach((state) => state.dispose());
    this.subject$.next([...items]);
  }

  clear(): S[] {
    const removed = [...this.items];
    // Dispose all states
    removed.forEach((state) => state.dispose());
    this.subject$.next([]);
    return removed;
  }
}
