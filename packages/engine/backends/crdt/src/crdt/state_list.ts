import { BehaviorSubject, Observable } from "rxjs";
import * as y from "yjs";
import { State } from "../../state.js";
import { AggregatedStateList } from "../../state_list.js";

export class AggregatedCrdtStateList<
  S extends State
> extends AggregatedStateList<S> {
  private readonly array: y.Array<S>;
  private readonly subject$: BehaviorSubject<S[]>;
  private readonly createState: () => S;

  constructor(array: y.Array<S>, createState: () => S) {
    super();
    this.array = array;
    this.createState = createState;

    // Initialize subject with current value
    const initial = array.doc ? array.toArray() : [];
    this.subject$ = new BehaviorSubject<S[]>(initial);

    this.observer = this.observer.bind(this);

    this.addInitializer(() => {
      this.array.observe(this.observer);
    });

    this.addDisposer(() => {
      this.array.unobserve(this.observer);
      this.subject$.complete();
    });
  }

  private observer() {
    this.subject$.next(this.array.toArray());
  }

  get items(): S[] {
    return this.subject$.value;
  }

  get items$(): Observable<S[]> {
    return this.subject$.asObservable();
  }

  add(item: S): void {
    this.array.push([item]);
  }

  append(items: S[]): void {
    this.array.push(items);
  }

  prepend(items: S[]): void {
    this.array.insert(0, items);
  }

  insertAt(index: number, items: S[]): void {
    this.array.insert(index, items);
  }

  remove(predicate: (item: S) => boolean): S[] {
    const snapshot = this.array.toArray();
    const removed: S[] = [];

    for (let i = snapshot.length - 1; i >= 0; i--) {
      if (predicate(snapshot[i])) {
        this.array.delete(i);
        removed.push(snapshot[i]);
      }
    }

    return removed;
  }

  removeAt(index: number, count: number = 1): S[] {
    const removed = this.array.toArray().slice(index, index + count);
    this.array.delete(index, count);
    return removed;
  }

  setItems(items: S[]): void {
    this.array.delete(0, this.array.length);
    this.array.push(items);
  }

  clear(): S[] {
    const removed = [...this.items];
    this.array.delete(0, this.array.length);
    return removed;
  }
}
