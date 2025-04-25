import { entityTypes, Expression, PropData } from "@elllphnt/elll-element";
import { combineLatestOrEmpty } from "@repo/utils";
import { BehaviorSubject, map, Observable } from "rxjs";
import { Component } from "../component";
import { Entity } from "./entity";

export class Prop extends Entity<PropData> {
  private _identifier$ = new BehaviorSubject<string | undefined>(undefined);
  private _tsType$ = new BehaviorSubject<string | undefined>(undefined);
  private _required$ = new BehaviorSubject<boolean | undefined>(undefined);
  private _default$ = new BehaviorSubject<Expression | undefined>(undefined);

  get identifier() {
    return this._identifier$.value;
  }
  get identifier$() {
    return this._identifier$.asObservable();
  }

  get default() {
    return this._default$.value;
  }
  get default$() {
    return this._default$.asObservable();
  }

  get tsType() {
    return this._tsType$.value;
  }
  get tsType$() {
    return this._tsType$.asObservable();
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
      tsType: this.tsType,
      required: this.required,
      default: this.default,
      identifier: this.identifier,
    } as PropData;
  }
  get data$(): Observable<PropData> {
    return combineLatestOrEmpty([
      super._data$,
      this._tsType$,
      this._required$,
      this._default$,
      this._identifier$,
    ]).pipe(
      map(([data, tsType, required, defaultVal, identifier]) => ({
        ...data,
        tsType,
        required,
        default: defaultVal,
        identifier,
      })),
    );
  }

  constructor({ id, component }: { id?: string; component: Component }) {
    super({ id, component, type: entityTypes.prop });

    this.addDisposer(() => {
      this._tsType$.complete();
      this._required$.complete();
      this._default$.complete();
    });
  }

  setDefault(defaultValue: Expression | undefined) {
    this._default$.next(defaultValue);
  }
  setIdentifier(identifier: string | undefined) {
    this._identifier$.next(identifier);
  }
  setTsType(tsType: string | undefined) {
    this._tsType$.next(tsType);
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
    this._tsType$.next(data.tsType);
    this._identifier$.next(data.identifier);
  }
}
