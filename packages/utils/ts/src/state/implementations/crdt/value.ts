import { BehaviorSubject, Observable } from "rxjs";
import * as y from "yjs";
import { ValueState } from "../../value.js";

export class CrdtValueState<T> extends ValueState<T> {
  private readonly map: y.Map<any>;
  private readonly key: string;
  private readonly subject$: BehaviorSubject<T>;

  constructor(map: y.Map<any>, key: string, initialValue: T) {
    super();
    this.map = map;
    this.key = key;

    // Initialize with existing value or provided initial value
    const current = map.has(key) ? map.get(key) : initialValue;
    this.subject$ = new BehaviorSubject<T>(current);

    // Set initial value if not present
    if (!map.has(key)) {
      map.set(key, initialValue);
    }

    this.observer = this.observer.bind(this);
    this.map.observe(this.observer);
  }

  private observer(event: y.YMapEvent<any>) {
    if (event.changes.keys.has(this.key)) {
      this.subject$.next(this.map.get(this.key));
    }
  }

  get value(): T {
    return this.subject$.value;
  }

  get value$(): Observable<T> {
    return this.subject$.asObservable();
  }

  setValue(data: T): void {
    this.map.set(this.key, data);
  }
}
