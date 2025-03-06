import {
  entityTypes,
  Evaluable,
  MapTransformerData,
} from "@elllphnt/elll-element";
import { combineLatestOrEmpty } from "@repo/utils";
import { BehaviorSubject, map, Observable } from "rxjs";
import { Component } from "../../component";
import { Transformer } from "./transformer";

export class MapTransformer extends Transformer<MapTransformerData> {
  private _source$ = new BehaviorSubject<Evaluable<any>>(undefined);
  private _fragmentId$ = new BehaviorSubject<Evaluable<any> | undefined>(
    undefined,
  );

  get source() {
    return this._source$.value;
  }
  get source$() {
    return this._source$.asObservable();
  }

  get fragmentId() {
    return this._fragmentId$.value;
  }
  get fragmentId$() {
    return this._fragmentId$.asObservable();
  }

  get data(): MapTransformerData {
    return {
      ...super._data,
      source: this.source,
    };
  }
  get data$(): Observable<MapTransformerData> {
    return combineLatestOrEmpty([
      super._data$,
      this.source$,
      this.fragmentId$,
    ]).pipe(
      map(([data, source, fragmentId]) => ({
        ...data,
        source,
        fragmentId,
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
    super({ id, type: entityTypes.transformers.map, component });
  }

  setSource(source: Evaluable<any>) {
    this._source$.next(source);
  }
  setFragmentId(fragmentId: string) {
    this._fragmentId$.next(fragmentId);
  }

  restore(data: MapTransformerData): void {
    super.restore(data);
    this._source$.next(data.source);
  }
}
