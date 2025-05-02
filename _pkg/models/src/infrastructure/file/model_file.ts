import {
  Enhancer,
  isFromEnhancer,
  ReactiveMap,
} from "@elllphnt/elementa-utils";
import { BehaviorSubject } from "rxjs";
import * as y from "yjs";
import { File } from "./file";

export abstract class ModelFile<M extends ReactiveMap<any>> extends File {
  private _model$: BehaviorSubject<M | undefined> = new BehaviorSubject<
    M | undefined
  >(undefined);

  private _enhance: Enhancer<y.Map<any>, M>;
  private _enhancer: Enhancer<y.Map<any>, M>;

  readonly model$ = this._model$.asObservable();
  get model(): M | undefined {
    return this._model$.getValue();
  }

  constructor({
    enhancer,
    enhance,
  }: {
    enhancer: Enhancer<y.Map<any>, M>;
    enhance: Enhancer<y.Map<any>, M>;
  }) {
    super();
    this._enhancer = enhancer;
    this._enhance = enhance;

    this.addDisposer(() => {
      this._model$.next(undefined);
      this._model$.complete();
    });
  }

  protected setModel(map: y.Map<any>): void {
    if (!isFromEnhancer(map, this._enhancer)) {
      if (!this._enhance(map)) {
        throw new Error("Failed to enhance yMap");
      }
    }

    this._model$.next(map);
  }
}
