import {
  entityTypes,
  Evaluable,
  RepeatTransformerData,
} from "@elllphnt/elll-element";
import { combineLatestOrEmpty } from "@repo/utils";
import { BehaviorSubject, map, Observable } from "rxjs";
import { Component } from "../../component";
import { Transformer } from "./transformer";

export class RepeatTransformer extends Transformer<RepeatTransformerData> {
  private _count$ = new BehaviorSubject<Evaluable<number> | undefined>(
    undefined,
  );
  private _fragmentId$ = new BehaviorSubject<Evaluable<string> | undefined>(
    undefined,
  );

  get count() {
    return this._count$.value;
  }
  get count$() {
    return this._count$.asObservable();
  }

  get fragmentId() {
    return this._fragmentId$.value;
  }
  get fragmentId$() {
    return this._fragmentId$.asObservable();
  }

  get data(): RepeatTransformerData {
    return {
      ...super._data,
      count: this.count,
    };
  }
  get data$(): Observable<RepeatTransformerData> {
    return combineLatestOrEmpty([
      super._data$,
      this.count$,
      this.fragmentId$,
    ]).pipe(
      map(([data, count, fragmentId]) => ({
        ...data,
        count,
        fragmentId,
      })),
    );
  }

  constructor({ id, component }: { id?: string; component: Component }) {
    super({ id, type: entityTypes.transformers.repeat, component });
  }

  setCount(count: Evaluable<number>) {
    this._count$.next(count);
  }
  setFragmentId(fragmentId: string) {
    this._fragmentId$.next(fragmentId);
  }

  restore(data: RepeatTransformerData): void {
    super.restore(data);
    this._count$.next(data.count);
    this._fragmentId$.next(data.fragment);
  }
}
