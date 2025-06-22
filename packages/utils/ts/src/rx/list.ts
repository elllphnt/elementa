import { Observable } from "rxjs";
import { State } from "./state.js";

export class ListState<T> extends State<T[]> {
  get items(): T[] {
    return this.value;
  }
  get items$(): Observable<T[]> {
    return this.value$;
  }

  constructor({ init }: { init: T[] }) {
    super({ init });
  }

  add(item: T): void {
    this.setValue([...this.value, item]);
  }
  remove(predicate: (item: T) => boolean): T[] {
    const removed: T[] = [];
    this.setValue(
      this.value.filter((i) => {
        if (predicate(i)) {
          removed.push(i);
          return false;
        }
        return true;
      })
    );
    return removed;
  }

  insertAt(index: number, items: T[]): void {
    const arr = this.value.slice();
    arr.splice(index, 0, ...items);
    this.setValue(arr);
  }
  removeAt(index: number, count: number = 1): T[] {
    const arr = this.value.slice();
    const items = arr.splice(index, count);
    this.setValue(arr);
    return items;
  }

  append(items: T[]): void {
    this.setValue([...this.value, ...items]);
  }
  prepend(items: T[]): void {
    this.setValue([...items, ...this.value]);
  }

  setItems(items: T[]): void {
    this.setValue(items);
  }
  clear(): T[] {
    const removed = [...this.value];
    this.setValue([]);
    return removed;
  }
}
