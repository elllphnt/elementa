import { BehaviorSubject, Observable } from "rxjs";

export abstract class StatefulFileModelAdaptor<
  T extends FileModelType = FileModelType,
  F extends File = File
> extends FileModelAdaptor<T, F> {
  private _model$ = new BehaviorSubject<FileModelInterface<T> | undefined>(
    undefined
  );

  abstract get data$(): Observable<any | undefined>;

  get model(): FileModelInterface<T> | undefined {
    return this._model$.value;
  }
  get model$(): Observable<FileModelInterface<T> | undefined> {
    return this._model$.asObservable();
  }

  constructor({ file, modelType }: { file: F; modelType: T }) {
    super({ file, modelType });

    this.addDisposer(() => {
      this._model$.complete();
      const model = this._model$.value;
      if (model && "dispose" in model && typeof model.dispose === "function") {
        model.dispose();
      }
    });
  }

  watchData() {
    const dataSubscription = this.data$.subscribe((data) => {
      const prev = this._model$.value;
      if (data !== undefined) {
        if (prev && "restore" in prev && typeof prev.restore === "function") {
          prev.restore(data);
        } else {
          switch (this.modelType) {
            case fileModelTypes.app:
              this._model$.next(
                new StatefulApp({
                  init: data,
                  file: this.file,
                }) as unknown as FileModelInterface<T>
              );
              break;
            case fileModelTypes.component:
              this._model$.next(
                new StatefulComponent({
                  init: data,
                  file: this.file,
                }) as unknown as FileModelInterface<T>
              );
              break;
            case fileModelTypes.keyframeSheet:
              this._model$.next(
                new StatefulKeyframeSheet({
                  init: data,
                  file: this.file,
                }) as unknown as FileModelInterface<T>
              );
              break;
            case fileModelTypes.packageSheet:
              this._model$.next(
                new StatefulPackageSheet({
                  init: data,
                  file: this.file,
                }) as unknown as FileModelInterface<T>
              );
              break;
            case fileModelTypes.router:
              this._model$.next(
                new StatefulRouter({
                  init: data,
                  file: this.file,
                }) as unknown as FileModelInterface<T>
              );
              break;
            case fileModelTypes.styleModifierSheet:
              this._model$.next(
                new StatefulStyleModifierSheet({
                  init: data,
                  file: this.file,
                }) as unknown as FileModelInterface<T>
              );
              break;
            case fileModelTypes.styleSystem:
              this._model$.next(
                new StatefulStyleSystem({
                  init: data,
                  file: this.file,
                }) as unknown as FileModelInterface<T>
              );
              break;
            case fileModelTypes.styleVariableSheet:
              this._model$.next(
                new StatefulStyleVariableSheet({
                  init: data,
                  file: this.file,
                }) as unknown as FileModelInterface<T>
              );
              break;
            case fileModelTypes.stylesheet:
              this._model$.next(
                new StatefulStylesheet({
                  init: data,
                  file: this.file,
                }) as unknown as FileModelInterface<T>
              );
              break;
            case fileModelTypes.typefaceSheet:
              this._model$.next(
                new StatefulTypefaceSheet({
                  init: data,
                  file: this.file,
                }) as unknown as FileModelInterface<T>
              );
              break;
          }
        }
      } else {
        this._model$.next(undefined);
        if (prev && "dispose" in prev && typeof prev.dispose === "function") {
          prev.dispose();
        }
      }
    });

    this.addDisposer(() => {
      dataSubscription.unsubscribe();
    });
  }
}
