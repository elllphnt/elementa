import { StateData, ValueStateData, entityTypes } from "@elllphnt/elll-element";
import { combineLatestOrEmpty, restoreReactiveObject } from "@repo/utils";
import { BehaviorSubject, Observable, map, of, switchMap } from "rxjs";
import { Schema } from "~/src/schema/schema";
import { Component } from "../../component";
import { State } from "./state";

export class ValueState extends State<ValueStateData> {
  private _initialValue$ = new BehaviorSubject<any>(undefined);
  private _schema$ = new BehaviorSubject<Schema | undefined>(undefined);

  get initialValue() {
    return this._initialValue$.value;
  }
  get initialValue$() {
    return this._initialValue$.asObservable();
  }

  get schema() {
    return this._schema$.value;
  }
  get schema$() {
    return this._schema$.asObservable();
  }

  get data(): ValueStateData {
    return {
      ...super._data,
      initialValue: this.initialValue,
      schema: this.schema?.data,
    };
  }
  get data$(): Observable<StateData> {
    return combineLatestOrEmpty([
      super._data$,
      this.initialValue$,
      this.schema$.pipe(switchMap((schema) => schema?.data$ ?? of(undefined))),
    ]).pipe(
      map(([data, initialValue, schema]) => ({
        ...data,
        initialValue,
        schema,
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
      this._schema$.complete();
    });
  }

  setInitialValue(value: any) {
    this._initialValue$.next(value);
  }

  setSchema(schema: Schema | undefined) {
    this._schema$.next(schema);
  }

  restore(data: ValueStateData) {
    super.restore(data);
    this._initialValue$.next(data.initialValue);
    restoreReactiveObject({
      datafiable$: this._schema$,
      data: data.schema,
      create: () => new Schema(),
      restore: (schema, data) => schema.restore(data),
      dispose: (schema) => schema.dispose(),
      identifyData: () => "constant",
      identifyDatafiable: () => "constant",
    });
  }
}
