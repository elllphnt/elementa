import {
  Evaluable,
  ExpressionMap,
  StyleData,
  StylePropertyName,
} from "@elllphnt/elll-element";
import { Disposable } from "@repo/utils";
import { BehaviorSubject, map } from "rxjs";
import { Datafiable } from "~/src/_lib/restore";

export class StyleOverridesMap
  extends Disposable
  implements Datafiable<ExpressionMap<StyleData>>
{
  private _data$ = new BehaviorSubject<ExpressionMap<StyleData>>({});

  get data() {
    return this._data$.value;
  }
  get data$() {
    return this._data$.asObservable();
  }

  override(property: StylePropertyName) {
    return this.data?.[property];
  }
  override$(property: StylePropertyName) {
    return this.data$.pipe(map((data) => data?.[property]));
  }

  setOverride<N extends StylePropertyName>(
    property: N,
    value: Evaluable<StyleData[N]> | undefined,
  ) {
    this._data$.next({
      ...this.data,
      [property]: value,
    });
  }
  clearOverride(property: StylePropertyName) {
    const data = { ...this.data };
    delete data[property];
    this._data$.next(data);
  }

  restore(data: ExpressionMap<StyleData>): void {
    this._data$.next(data);
  }
}
