import {
  Disposable,
  Enhancer,
  getEnhancers,
  isFromEnhancer,
  ReactiveMap,
} from "@elllphnt/elementa-utils";
import { BehaviorSubject, tap } from "rxjs";
import * as y from "yjs";
import { File } from "./file";

export abstract class FileModel<M extends ReactiveMap<any>> extends Disposable {
  readonly file: File;

  private _model$: BehaviorSubject<M | undefined> = new BehaviorSubject<
    M | undefined
  >(undefined);

  private _enhance: Enhancer<y.Map<any>, M>;
  private _enhancer: Enhancer<y.Map<any>, M>;

  readonly model$ = this._model$.asObservable().pipe(
    tap((m) => {
      console.log("Model changed", m?.toJSON());
    })
  );
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

    this.model$.subscribe((model) => {
      if (model) {
        console.log("Model set", model.toJSON());
      } else {
        console.log("Model cleared");
      }
    });

    this.addDisposer(() => {
      console.log("Disposing model");
      // this._model$.next(undefined);
      // this._model$.complete();
    });
  }

  protected setModel(map: y.Map<any>): void {
    console.log({
      map,
      enhancers: getEnhancers(map),
    });
    if (!isFromEnhancer(map, this._enhancer)) {
      if (!this._enhance(map)) {
        throw new Error("Failed to enhance yMap");
      }
    }

    console.log("Setting model", map.toJSON());
    this._model$.next(map);
  }
  protected clearModel(): void {
    console.log("Clearing model");
    this._model$.next(undefined);
  }
}
