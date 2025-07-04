import { ValueState } from "@elllphnt/elementa-kernel";
import type { Observable } from "rxjs";
import { BehaviorSubject } from "rxjs";
import type * as y from "yjs";

export class CrdtValueState<T> extends ValueState<T> {
  private readonly map: y.Map<any>;
  private readonly propertyKey: string;
  private readonly subject$: BehaviorSubject<T>;

  constructor(map: y.Map<any>, key: string, initialValue: T) {
    super();
    this.map = map;
    this.propertyKey = key;

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
    if (event.changes.keys.has(this.propertyKey)) {
      this.subject$.next(this.map.get(this.propertyKey));
    }
  }

  get value(): T {
    return this.subject$.value;
  }

  get value$(): Observable<T> {
    return this.subject$.asObservable();
  }

  setValue(data: T): void {
    this.map.set(this.propertyKey, data);
  }

  dispose(): void {
    this.map.unobserve(this.observer);
    this.subject$.complete();
  }
}
