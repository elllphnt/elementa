import { map, Observable } from "rxjs";
import { NonOptionalKeys } from "../types/_.js";
import { State } from "./state.js";

export class RecordState<T extends Record<string, unknown>> extends State<T> {
  get record(): T {
    return this.value;
  }
  get record$(): Observable<T> {
    return this.value$;
  }

  entry<K extends keyof T>(key: K): T[K] {
    return this.value[key];
  }
  entry$<K extends keyof T>(key: K): Observable<T[K]> {
    return this.value$.pipe(map((state) => state[key] as T[K]));
  }

  constructor({ init }: { init: T }) {
    super({ init });
  }

  set<K extends keyof T>(key: K, value: T[K]): void {
    this.setValue({ ...this.value, [key]: value });
  }
  remove<K extends NonOptionalKeys<T>>(key: K): T[K] | undefined {
    const { [key]: removed, ...rest } = this.value;
    this.setValue(rest as T);
    return removed;
  }

  setAll(data: Partial<T>): void {
    this.setValue({ ...this.value, ...data });
  }
  removeAll(keys: (keyof T)[]): void {
    const rest = Object.fromEntries(
      Object.entries(this.value).filter(
        ([key]) => !keys.includes(key as keyof T)
      )
    );
    this.setValue(rest as T);
  }

  setRecord(data: T): void {
    this.setValue(data);
  }
}
