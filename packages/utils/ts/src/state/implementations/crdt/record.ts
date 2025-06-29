import { BehaviorSubject, Observable } from "rxjs";
import { map } from "rxjs/operators";
import * as y from "yjs";
import { RecordState } from "../../record.js";

export class CrdtRecordState<
  T extends Record<string, unknown>
> extends RecordState<T> {
  private readonly map: y.Map<any>;
  private readonly subject$: BehaviorSubject<T>;

  constructor(map: y.Map<any>) {
    super();
    this.map = map;

    const initial: Record<string, any> = {};
    for (const [key, value] of map.entries()) {
      initial[key] = value;
    }

    this.subject$ = new BehaviorSubject(initial as T);

    this.observer = this.observer.bind(this);
    this.map.observe(this.observer);
  }

  private observer(event: y.YMapEvent<any>) {
    const current = { ...this.subject$.value };
    for (const [key, change] of event.changes.keys.entries()) {
      if (change.action === "add" || change.action === "update") {
        (current as any)[key] = this.map.get(key);
      } else if (change.action === "delete") {
        delete current[key];
      }
    }
    this.subject$.next(current as T);
  }

  get record(): T {
    return this.subject$.value;
  }

  get record$(): Observable<T> {
    return this.subject$.asObservable();
  }

  entry<K extends keyof T>(key: K): T[K] {
    return this.map.get(key as string);
  }

  entry$<K extends keyof T>(key: K): Observable<T[K]> {
    return this.record$.pipe(map((v) => v[key]));
  }

  set<K extends keyof T>(key: K, value: T[K]): void {
    this.map.set(key as string, value);
  }

  remove<K extends keyof T>(key: K): T[K] | undefined {
    const value = this.map.get(key as string);
    this.map.delete(key as string);
    return value;
  }

  setAll(data: Partial<T>): void {
    Object.entries(data).forEach(([k, v]) => {
      this.map.set(k, v);
    });
  }

  removeAll(keys: (keyof T)[]): void {
    keys.forEach((key) => this.map.delete(key as string));
  }

  setRecord(data: T): void {
    this.map.clear();
    Object.entries(data).forEach(([k, v]) => {
      this.map.set(k, v);
    });
  }

  dispose(): void {
    this.map.unobserve(this.observer);
    this.subject$.complete();
  }
}
