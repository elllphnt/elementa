import {
  File,
  FileModelAdaptor,
  FileModelInterface,
  FileModelType,
  fileModelTypes,
} from "@elllphnt/elementa-core";
import { BehaviorSubject, Observable } from "rxjs";
import * as y from "yjs";
import {
  CrdtApp,
  CrdtComponent,
  CrdtKeyframeSheet,
  CrdtPackageSheet,
  CrdtRouter,
  CrdtStyleModifierSheet,
  CrdtStyleSystem,
  CrdtStyleVariableSheet,
  CrdtStylesheet,
  CrdtTypefaceSheet,
} from "~/models/_.js";

export abstract class CrdtFileModelAdaptor<
  T extends FileModelType = FileModelType,
  F extends File = File
> extends FileModelAdaptor<T, F> {
  private _crdt$ = new BehaviorSubject<y.AbstractType<any> | undefined>(
    undefined
  );
  private _model$ = new BehaviorSubject<FileModelInterface<T> | undefined>(
    undefined
  );

  get crdt$(): Observable<y.AbstractType<any> | undefined> {
    return this._crdt$;
  }
  get crdt(): y.AbstractType<any> | undefined {
    return this._crdt$.value;
  }

  get model() {
    return this._model$.value;
  }
  get model$() {
    return this._model$.asObservable();
  }

  constructor({ file, modelType }: { file: F; modelType: T }) {
    super({ file, modelType });

    const crdtSubscription = this.crdt$.subscribe((crdt) => {
      const prev = this._model$.value;
      if (crdt) {
        switch (modelType) {
          case fileModelTypes.app:
            this._model$.next(
              new CrdtApp({
                crdt: crdt as y.Map<any>,
                file,
                initialized: true,
              }) as unknown as FileModelInterface<T>
            );
            break;
          case fileModelTypes.component:
            this._model$.next(
              new CrdtComponent({
                crdt: crdt as y.Map<any>,
                file,
                initialized: true,
              }) as unknown as FileModelInterface<T>
            );
            break;
          case fileModelTypes.keyframeSheet:
            this._model$.next(
              new CrdtKeyframeSheet({
                crdt: crdt as y.Map<any>,
                file,
                initialized: true,
              }) as unknown as FileModelInterface<T>
            );
            break;
          case fileModelTypes.packageSheet:
            this._model$.next(
              new CrdtPackageSheet({
                crdt: crdt as y.Map<any>,
                file,
                initialized: true,
              }) as unknown as FileModelInterface<T>
            );
            break;
          case fileModelTypes.router:
            this._model$.next(
              new CrdtRouter({
                crdt: crdt as y.Map<any>,
                file,
                initialized: true,
              }) as unknown as FileModelInterface<T>
            );
            break;
          case fileModelTypes.styleModifierSheet:
            this._model$.next(
              new CrdtStyleModifierSheet({
                crdt: crdt as y.Map<any>,
                file,
                initialized: true,
              }) as unknown as FileModelInterface<T>
            );
            break;
          case fileModelTypes.styleSystem:
            this._model$.next(
              new CrdtStyleSystem({
                crdt: crdt as y.Map<any>,
                file,
                initialized: true,
              }) as unknown as FileModelInterface<T>
            );
            break;
          case fileModelTypes.styleVariableSheet:
            this._model$.next(
              new CrdtStyleVariableSheet({
                crdt: crdt as y.Map<any>,
                file,
                initialized: true,
              }) as unknown as FileModelInterface<T>
            );
            break;
          case fileModelTypes.stylesheet:
            this._model$.next(
              new CrdtStylesheet({
                crdt: crdt as y.Map<any>,
                file,
                initialized: true,
              }) as unknown as FileModelInterface<T>
            );
            break;
          case fileModelTypes.typefaceSheet:
            this._model$.next(
              new CrdtTypefaceSheet({
                crdt: crdt as y.Map<any>,
                file,
                initialized: true,
              }) as unknown as FileModelInterface<T>
            );
            break;
        }
      } else {
        this._model$.next(undefined);
      }
      if (prev && "dispose" in prev && typeof prev.dispose === "function") {
        prev.dispose();
      }
    });

    this.addDisposer(() => {
      this._crdt$.complete();
      this._model$.complete();

      crdtSubscription.unsubscribe();
      const model = this._model$.value;
      if (model && "dispose" in model && typeof model.dispose === "function") {
        model.dispose();
      }
    });
  }

  setCrdt(crdt: y.AbstractType<any> | undefined): void {
    this._crdt$.next(crdt);
  }
}
