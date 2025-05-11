import { BehaviorSubject, Observable } from "rxjs";
import { Disposable } from "../core/_";

export abstract class State<D> extends Disposable {
  private _value$: BehaviorSubject<D>;

  protected get value(): D {
    return this._value$.getValue();
  }
  protected get value$(): Observable<D> {
    return this._value$.asObservable();
  }

  constructor({ init }: { init: D }) {
    super();
    this._value$ = new BehaviorSubject(init);
    this.addDisposer(() => {
      this._value$.complete();
    });
  }

  protected setValue(data: D): void {
    this._value$.next(data);
  }
}
