import { Observable } from "rxjs";
import { State } from "./state.js";

export abstract class ValueState<D> extends State {
  abstract get value(): D;
  abstract get value$(): Observable<D>;

  abstract setValue(data: D): void;
}
