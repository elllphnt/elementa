import {
  entityTypes,
  Evaluable,
  SwitchTransformerCaseData,
  SwitchTransformerData,
} from "@elllphnt/elll-element";
import { combineLatestOrEmpty } from "@repo/utils";
import { BehaviorSubject, map, Observable } from "rxjs";
import { Component } from "../../component";
import { Transformer } from "./transformer";

export class SwitchTransformer extends Transformer<SwitchTransformerData> {
  private _value$ = new BehaviorSubject<Evaluable<any> | undefined>(undefined);
  private _cases$ = new BehaviorSubject<SwitchTransformerCaseData[]>([]);
  private _default$ = new BehaviorSubject<Evaluable<any> | undefined>(
    undefined,
  );

  get value() {
    return this._value$.value;
  }
  get value$() {
    return this._value$.asObservable();
  }

  get cases() {
    return this._cases$.value;
  }
  get cases$() {
    return this._cases$.asObservable();
  }

  get default() {
    return this._default$.value;
  }
  get default$() {
    return this._default$.asObservable();
  }

  get data(): SwitchTransformerData {
    return {
      ...super._data,
      value: this.value,
      cases: this.cases,
      default: this.default,
    };
  }
  get data$(): Observable<SwitchTransformerData> {
    return combineLatestOrEmpty([
      super._data$,
      this.value$,
      this.cases$,
      this.default$,
    ]).pipe(
      map(([data, value, cases, _default]) => ({
        ...data,
        value,
        cases,
        default: _default,
      })),
    );
  }

  constructor({
    id,
    component,
  }: {
    id?: string | undefined;
    component: Component;
  }) {
    super({ id, type: entityTypes.transformers.switch, component });
  }

  setValue(value: Evaluable<any>) {
    this._value$.next(value);
  }
  setDefault(defaultValue: Evaluable<any> | undefined) {
    this._default$.next(defaultValue);
  }
  addCase(data: SwitchTransformerCaseData) {
    this._cases$.next([...this.cases, data]);
  }
  removeCase(index: number) {
    this._cases$.next(this.cases.filter((_, i) => index !== i));
  }
  updateCase(index: number, update: Partial<SwitchTransformerCaseData>) {
    this._cases$.next(
      this.cases.map((c, i) => (index === i ? { ...c, ...update } : c)),
    );
  }

  restore(data: SwitchTransformerData): void {
    super.restore(data);
    this._value$.next(data.value);
    this._cases$.next(data.cases ?? []);
    this._default$.next(data.default);
  }
}
