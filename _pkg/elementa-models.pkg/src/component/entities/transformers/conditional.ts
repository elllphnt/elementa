import {
  ConditionalTransformerConditionData,
  ConditionalTransformerData,
  entityTypes,
  Evaluable,
} from "@elllphnt/elll-element";
import { combineLatestOrEmpty } from "@repo/utils";
import { BehaviorSubject, map, Observable } from "rxjs";
import { Component } from "../../component";
import { Transformer } from "./transformer";

export class ConditionalTransformer extends Transformer<ConditionalTransformerData> {
  private _conditions$ = new BehaviorSubject<
    ConditionalTransformerConditionData[]
  >([]);
  private _default$ = new BehaviorSubject<Evaluable<any> | undefined>(
    undefined,
  );

  get conditions() {
    return this._conditions$.value;
  }
  get conditions$() {
    return this._conditions$.asObservable();
  }

  get default() {
    return this._default$.value;
  }
  get default$() {
    return this._default$.asObservable();
  }

  get data(): ConditionalTransformerData {
    return {
      ...super._data,
      conditions: this.conditions,
      default: this.default,
    };
  }
  get data$(): Observable<ConditionalTransformerData> {
    return combineLatestOrEmpty([
      super._data$,
      this.conditions$,
      this.default$,
    ]).pipe(
      map(([data, conditions, _default]) => ({
        ...data,
        conditions,
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
    super({ id, type: entityTypes.transformers.conditional, component });
  }

  setDefault(defaultValue: Evaluable<any> | undefined) {
    this._default$.next(defaultValue);
  }
  addCondition(condition: ConditionalTransformerConditionData) {
    this._conditions$.next([...this.conditions, condition]);
  }
  removeCondition(index: number) {
    this._conditions$.next(this.conditions.filter((_, i) => i !== index));
  }
  updateCondition(
    index: number,
    update: Partial<ConditionalTransformerConditionData>,
  ) {
    this._conditions$.next(
      this.conditions.map((c, i) =>
        i === index
          ? {
              ...c,
              ...update,
            }
          : c,
      ),
    );
  }

  restore(data: ConditionalTransformerData): void {
    super.restore(data);
    this._conditions$.next(data.conditions ?? []);
    this._default$.next(data.default);
  }
}
