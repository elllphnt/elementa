import { BehaviorSubject, Observable } from "rxjs";
import { map } from "rxjs/operators";
import { RecordState } from "../../record.js";

export class JsonRecordState<
  T extends Record<string, unknown>
> extends RecordState<T> {
  private readonly subject$: BehaviorSubject<T>;

  constructor(init: T) {
    super();
    this.subject$ = new BehaviorSubject<T>({ ...init });

    this.addDisposer(() => {
      this.subject$.complete();
    });
  }

  get record(): T {
    return this.subject$.value;
  }

  get record$(): Observable<T> {
    return this.subject$.asObservable();
  }

  entry<K extends keyof T>(key: K): T[K] {
    return this.subject$.value[key];
  }

  entry$<K extends keyof T>(key: K): Observable<T[K]> {
    return this.record$.pipe(map((v) => v[key]));
  }

  set<K extends keyof T>(key: K, value: T[K]): void {
    const current = { ...this.subject$.value };
    current[key] = value;
    this.subject$.next(current);
  }

  remove<K extends keyof T>(key: K): T[K] | undefined {
    const current = { ...this.subject$.value };
    const value = current[key];
    delete current[key];
    this.subject$.next(current);
    return value;
  }

  setAll(data: Partial<T>): void {
    const current = { ...this.subject$.value };
    Object.assign(current, data);
    this.subject$.next(current);
  }

  removeAll(keys: (keyof T)[]): void {
    const current = { ...this.subject$.value };
    keys.forEach((key) => delete current[key]);
    this.subject$.next(current);
  }

  setRecord(data: T): void {
    this.subject$.next({ ...data });
  }
}
