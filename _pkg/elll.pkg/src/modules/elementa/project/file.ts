import { File, IFileDrive, Query } from "@repo/backend";
import { Disposable } from "@repo/utils";
import { BehaviorSubject, map, Observable, of, switchMap } from "rxjs";
import { mimeTypes } from "~/src/libs/mimetypes";
import { IElll } from "~/src/types/elll";
import { Model } from "../../elll/model/model";

export abstract class SynchronizedDataFile<D = any> extends Disposable {
  readonly drive: IFileDrive;

  private _fileQuery: Query<File, File | undefined>;

  get file() {
    return this._fileQuery.data;
  }
  get file$() {
    return this._fileQuery.data$;
  }

  get loading() {
    return this._fileQuery.fetching;
  }
  get loading$() {
    return this._fileQuery.fetching$;
  }

  get loaded() {
    return !!this._fileQuery.data;
  }
  get loaded$() {
    return this._fileQuery.data$.pipe(map((file) => !!file));
  }

  abstract get sourceData$(): Observable<D>;
  abstract get data$(): Observable<D>;

  constructor({ drive, path }: { drive: IFileDrive; path: string }) {
    super();
    this.drive = drive;
    this._fileQuery = drive.fileAtPath(path, {
      autoFetch: true,
      create: { type: mimeTypes.json },
    });
  }

  protected watchData() {
    let syncing = false;

    // Restore data
    const restoreSubscription = this.sourceData$.subscribe((data) => {
      if (syncing) return;
      try {
        syncing = true;
        this.restore(data);
      } finally {
        syncing = false;
      }
    });

    // Save data
    const saveSubscription = this.data$.subscribe((data) => {
      if (syncing) return;
      try {
        syncing = true;
        this.save(data);
      } finally {
        syncing = false;
      }
    });

    this.addDisposer(() => {
      restoreSubscription.unsubscribe();
      saveSubscription.unsubscribe();
    });
  }

  abstract restore(data: D): void;
  abstract save(data: D): void;
}

export abstract class SynchronizedModelFile<
  D = any,
> extends SynchronizedDataFile<D> {
  readonly elll: IElll;

  private _model$ = new BehaviorSubject<Model | undefined>(undefined);

  get model() {
    return this._model$.value;
  }
  get model$() {
    return this._model$.asObservable();
  }

  get loading() {
    return super.loading || !!this.model?.content?.loading;
  }
  get loading$() {
    return super.loading$.pipe(
      switchMap((loading) => {
        if (loading) return of(true);
        return this.model?.content?.loading$ ?? of(false);
      }),
    );
  }

  get loaded() {
    return super.loaded && !!this.model?.content?.loaded;
  }
  get loaded$() {
    return super.loaded$.pipe(
      switchMap((loaded) => {
        if (!loaded) return of(false);
        return this.model?.content?.loaded$ ?? of(false);
      }),
    );
  }

  protected get _modelSourceData$(): Observable<D | undefined> {
    return this.model$.pipe(
      switchMap((model) =>
        model?.content ? model.content?.data$ : of(undefined),
      ),
    );
  }

  constructor({
    elll,
    drive,
    path,
    model,
  }: {
    elll: IElll;
    drive: IFileDrive;
    path: string;
    model: string;
  }) {
    super({
      drive,
      path,
    });
    this.elll = elll;

    const modelSubscription = this.file$.subscribe((file) => {
      this._model$.next(
        file ? this.elll.modelManager.getModel(model, file.url) : undefined,
      );
    });

    this.addDisposer(() => {
      this._model$.complete();
      modelSubscription.unsubscribe();
    });
  }

  save(data: D): void {
    this.model?.content?.update(data);
  }
}
