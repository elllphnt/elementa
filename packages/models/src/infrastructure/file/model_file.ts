import {
  Disposable,
  Enhancer,
  isFromEnhancer,
  ReactiveMap,
} from "@elllphnt/elementa-utils";
import { BehaviorSubject } from "rxjs";
import * as y from "yjs";
import { File } from "./file.js";

export abstract class ModelFile<M extends ReactiveMap> extends Disposable {
  readonly file: File;

  private _model$: BehaviorSubject<M | undefined> = new BehaviorSubject<
    M | undefined
  >(undefined);

  private _enhance: Enhancer<y.Map<any>, M>;
  private _enhancer: Enhancer<y.Map<any>, M>;

  model$ = this._model$.asObservable();
  get model(): M | undefined {
    return this._model$.getValue();
  }

  constructor({
    file,
    enhancer,
    enhance,
  }: {
    file: File;
    enhancer: Enhancer<y.Map<any>, M>;
    enhance: Enhancer<y.Map<any>, M>;
  }) {
    super();
    this.file = file;
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
  protected clearModel(): void {
    this._model$.next(undefined);
  }
}
