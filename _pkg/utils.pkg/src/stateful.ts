import { BehaviorSubject, map, Observable } from "rxjs";
import { Disposable } from "./disposable";

export class StateTransaction {
  states: Map<StatefulObject<any>, any> = new Map();

  stateOf(statefulObject: StatefulObject<any>) {
    return this.states.get(statefulObject) ?? statefulObject.state;
  }
  setState(statefulObject: StatefulObject<any>, state: any) {
    this.states.set(statefulObject, state);
  }
}

export class Doc<S extends object> extends Disposable {
  private _transaction: StateTransaction | undefined = undefined;
  private _objects: Map<string, StatefulObject<S>> = new Map();

  startTransaction() {
    if (this._transaction) {
      throw new Error("A transaction is already in progress");
    }
    this._transaction = new StateTransaction();
  }
  commitTransaction() {
    if (!this._transaction) {
      throw new Error("No transaction in progress");
    }
    this._transaction.states.forEach((state, statefulObject) => {
      statefulObject.setState(state);
    });
    this._transaction = undefined;
  }
  cancelTransaction() {
    this._transaction = undefined;
  }

  getMap(key: string) {}
  getList(key: string) {}
}

export class StatefulObject<D extends object> extends Disposable {
  private _state$: BehaviorSubject<D>;

  get state$(): Observable<D> {
    return this._state$.asObservable();
  }
  get state(): D {
    return this._state$.value;
  }

  selection<S>(selector: (state: D) => S): S {
    return selector(this.state);
  }
  selection$<S>(selector: (state: D) => S): Observable<S> {
    return this.state$.pipe(map(selector));
  }

  constructor({ initialState }: { initialState: D }) {
    super();
    this._state$ = new BehaviorSubject(initialState);

    this.addDisposer(() => {
      this._state$.complete();
    });
  }

  setState(state: D) {
    this._state$.next(state);
  }
  updateState(updateOrUpdater: Partial<D> | ((state: D) => D)) {
    const updater =
      typeof updateOrUpdater === "function"
        ? updateOrUpdater
        : (state: D) => ({ ...state, ...updateOrUpdater });
    this._state$.next(updater(this.state!));
  }
}
