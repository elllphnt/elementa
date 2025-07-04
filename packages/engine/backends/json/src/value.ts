import type { Backend, ValueState } from "@elllphnt/elementa-kernel";
import { BehaviorSubject } from "rxjs";
import { JsonState } from "./state.js";

export class JsonValueState<T> extends JsonState implements ValueState<T> {
  private readonly subject$: BehaviorSubject<T>;

  constructor({ init, backend }: { init: T; backend: Backend }) {
    super({ backend });
    this.subject$ = new BehaviorSubject<T>(init);

    this.addDisposer(() => {
      this.subject$.complete();
    });
  }

  get value() {
    return this.subject$.value;
  }
  get value$() {
    return this.subject$.asObservable();
  }

  setValue(state: T): T {
    const prev = this.subject$.value;
    this.subject$.next(state);
    return prev;
  }
}
