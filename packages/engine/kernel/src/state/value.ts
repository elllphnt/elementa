import type { Observable } from "rxjs";
import type { State } from "./state.js";

export interface ValueState<T> extends State {
  get value(): T;
  get value$(): Observable<T>;

  setValue(state: T): T;
}
