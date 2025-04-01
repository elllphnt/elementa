import { StateData, ValueStateData, entityTypes } from "@elllphnt/elll-element";
import { combineLatestOrEmpty } from "@repo/utils";
import { BehaviorSubject, Observable, map } from "rxjs";
import { Component } from "../../component";
import { State } from "./state";

export class ValueState extends State<ValueStateData> {
  private _initialValue$ = new BehaviorSubject<any>(undefined);
  private _tsType$ = new BehaviorSubject<string | undefined>(undefined);

  get initialValue() {
    return this._initialValue$.value;
  }
  get initialValue$() {
    return this._initialValue$.asObservable();
  }

  get tsType() {
    return this._tsType$.value;
  }
  get tsType$() {
    return this._tsType$.asObservable();
  }

  get data(): ValueStateData {
    return {
      ...super._data,
      initialValue: this.initialValue,
      tsType: this.tsType,
    };
  }
  get data$(): Observable<StateData> {
    return combineLatestOrEmpty([
      super._data$,
      this.initialValue$,
      this.tsType$,
    ]).pipe(
      map(([data, initialValue, tsType]) => ({
        ...data,
        initialValue,
        tsType,
      })),
    );
  }

  constructor({ id, component }: { id?: string; component: Component }) {
    super({
      id,
      component,
      type: entityTypes.states.value,
    });

    this.addDisposer(() => {
      this._initialValue$.complete();
      this._tsType$.complete();
    });
  }

  setInitialValue(value: any) {
    this._initialValue$.next(value);
  }

  setTsType(tsType: string | undefined) {
    this._tsType$.next(tsType);
  }

  restore(data: ValueStateData) {
    super.restore(data);
    this._initialValue$.next(data.initialValue);
  }
}
