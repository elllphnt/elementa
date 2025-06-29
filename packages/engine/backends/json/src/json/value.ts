import { BehaviorSubject, Observable } from "rxjs";
import { ValueState } from "../../value.js";

export class JsonValueState<T> extends ValueState<T> {
  private readonly subject$: BehaviorSubject<T>;

  constructor(initialValue: T) {
    super();
    this.subject$ = new BehaviorSubject<T>(initialValue);
  }

  get value(): T {
    return this.subject$.value;
  }

  get value$(): Observable<T> {
    return this.subject$.asObservable();
  }

  setValue(data: T): void {
    this.subject$.next(data);
  }

  dispose(): void {
    this.subject$.complete();
  }
}
