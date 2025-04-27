import { BehaviorSubject, Observable } from "rxjs";
import { Disposable } from "../core/disposable";

export abstract class ReactiveState<S> extends Disposable {
  protected readonly _state$: BehaviorSubject<S>;

  constructor(initial: S) {
    super();
    this._state$ = new BehaviorSubject(initial);

    this.addDisposer(() => {
      this._state$.complete();
    });
  }

  /**
   * Current synchronous value of the state
   */
  get value(): S {
    return this._state$.value;
  }

  /**
   * Observable stream of changes
   */
  get value$(): Observable<S> {
    return this._state$.asObservable();
  }

  /**
   * Replace the entire state atomically
   * @param next - New state object
   */
  set(next: S): void {
    this._state$.next(next);
  }

  /**
   * Patch fields on the current state
   * @param patch - Partial update to merge with existing state
   */
  patch(patch: Partial<S>): void {
    this._state$.next({ ...this._state$.value, ...patch });
  }
}
