import {
  entityTypes,
  Expression,
  PropData,
  SchemaData,
} from "@elllphnt/elll-element";
import { combineLatestOrEmpty } from "@repo/utils";
import { BehaviorSubject, map, Observable, of, switchMap } from "rxjs";
import { restoreReactiveObject } from "~/src/_lib/restore";
import { Schema } from "~/src/schema/_";
import { Component } from "../component";
import { Entity } from "./entity";

export class Prop extends Entity<PropData> {
  private _schema$ = new BehaviorSubject<Schema | undefined>(undefined);
  private _required$ = new BehaviorSubject<boolean | undefined>(undefined);
  private _default$ = new BehaviorSubject<Expression | undefined>(undefined);

  get default() {
    return this._default$.value;
  }
  get default$() {
    return this._default$.asObservable();
  }

  get schema() {
    return this._schema$.value;
  }
  get schema$() {
    return this._schema$.asObservable();
  }

  get required() {
    return this._required$.value;
  }
  get required$() {
    return this._required$.asObservable();
  }

  get data(): PropData {
    return {
      ...super._data,
      schema: this.schema?.data,
      required: this.required,
      default: this.default,
    } as PropData;
  }
  get data$(): Observable<PropData> {
    return combineLatestOrEmpty([
      super._data$,
      this._schema$.pipe(switchMap((schema) => schema?.data$ ?? of(undefined))),
      this._required$,
      this._default$,
    ]).pipe(
      map(([data, schema, required, defaultVal]) => ({
        ...data,
        schema: schema as SchemaData | undefined,
        required,
        default: defaultVal,
      })),
    );
  }

  constructor({ id, component }: { id?: string; component: Component }) {
    super({ id, component, type: entityTypes.prop });

    this.addDisposer(() => {
      this._schema$.complete();
      this._required$.complete();
      this._default$.complete();
    });
  }

  setDefault(defaultValue: Expression | undefined) {
    this._default$.next(defaultValue);
  }
  setSchema(schema: Schema | undefined) {
    this._schema$.next(schema);
  }
  setRequired(required: boolean) {
    this._required$.next(required);
  }

  remove(): void {
    this.component.removeProp(this);
  }

  restore(data: PropData) {
    super.restore(data);
    this._required$.next(data.required);
    this._default$.next(data.default);

    restoreReactiveObject({
      data: data.schema,
      datafiable$: this._schema$,
      create: () => new Schema(),
      restore: (schema, data) => schema.restore(data),
      dispose: (schema) => schema.dispose(),
      identifyData: (data) => data.type,
      identifyDatafiable: (schema) => schema.data.type,
    });
  }
}
