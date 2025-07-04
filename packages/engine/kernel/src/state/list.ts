import type { Observable } from "rxjs";
import type { State } from "./state.js";

export interface ListState<T> extends State {
  get items(): T[];
  get items$(): Observable<T[]>;

  add(item: T): void;
  append(items: T[]): void;

  prepend(items: T[]): void;
  insertAt(index: number, items: T[]): void;

  remove(predicate: (item: T) => boolean): T[];
  removeAt(index: number, count?: number): T[];

  setItems(items: T[]): void;

  clear(): T[];
}
