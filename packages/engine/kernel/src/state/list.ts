import { Observable } from "rxjs";
import { Lifecycle } from "../../core/lifecycle.js";

export abstract class ListState<T> extends Lifecycle {
  abstract get items(): T[];
  abstract get items$(): Observable<T[]>;

  abstract add(item: T): void;
  abstract append(items: T[]): void;

  abstract prepend(items: T[]): void;
  abstract insertAt(index: number, items: T[]): void;

  abstract remove(predicate: (item: T) => boolean): T[];
  abstract removeAt(index: number, count?: number): T[];

  abstract setItems(items: T[]): void;

  abstract clear(): T[];
}
