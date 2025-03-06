import { File } from "@repo/backend";
import { Disposable } from "@repo/utils";
import { diff } from "deep-object-diff";
import _ from "lodash";
import { Observable, of, Subject } from "rxjs";
import { Elll } from "../elll/elll";

export type VersionedData<D extends {}> = D & {
  _version?: number;
};

export class Persistor<D extends {}> extends Disposable {
  elll: Elll;

  private _resolveFile: (elll: Elll) => File | undefined;
  private _resolveFile$: (elll: Elll) => Observable<File | undefined>;

  private _data: VersionedData<D> | undefined;
  private _data$ = new Subject<D>();
  private _loaded = false;
  private _loaded$ = new Subject<boolean>();

  get version(): number {
    return this._data?._version ?? 0;
  }

  get file(): File | undefined {
    return this._resolveFile(this.elll);
  }
  get file$(): Observable<File | undefined> {
    return this._resolveFile$(this.elll);
  }

  get fileText(): string | undefined {
    return "";
  }
  get fileText$(): Observable<string | undefined> {
    return of("");
  }

  get fileLoaded$(): Observable<boolean> {
    return of(false);
  }
  get fileLoaded(): boolean {
    return false;
  }

  get loaded$(): Observable<boolean> {
    return this._loaded$.asObservable();
  }
  get loaded(): boolean {
    return this._loaded;
  }

  get data$(): Observable<D> {
    return this._data$.asObservable();
  }
  get data(): D | undefined {
    const { _version, ...withoutVersion } = this._data ?? {};
    return withoutVersion as D;
  }

  constructor({
    elll,
    resolveFile,
    resolveFile$,
  }: {
    elll: Elll;
    resolveFile: (elll: Elll) => File | undefined;
    resolveFile$: (elll: Elll) => Observable<File | undefined>;
  }) {
    super();
    this.elll = elll;
    this._resolveFile = resolveFile;
    this._resolveFile$ = resolveFile$;

    // update data when file changes
    const fileSubscription = this.fileText$.subscribe((text) => {
      this.handleFileText(text);
    });
    const loadedSubscription = this.fileLoaded$.subscribe((loaded) => {
      if (loaded) {
        setTimeout(() => {
          this.setLoaded();
        }, 1);
      }
    });
    const loadSubscription = this.file$.subscribe((file) => {
      if (!file?.contentLoaded) {
        file?.fetchContent();
      }
    });

    this.addDisposer(() => {
      fileSubscription.unsubscribe();
      loadedSubscription.unsubscribe();
      loadSubscription.unsubscribe();
      this._loaded$.complete();
      this._data$.complete();
    });
  }

  handleFileText(text: string | undefined): void {
    if (!text) {
      if (this.file?.contentLoaded && !this.loaded) {
        // the file is loaded but is empty
        this.setLoaded();
      }
      return;
    }

    let data: VersionedData<D>;
    try {
      data = JSON.parse(text.trim());
    } catch (e) {
      console.error(`Failed to deserialize data for file ${this.file?.id}`);
      throw e;
    }

    this.load(data);
  }

  load(data: VersionedData<D>): void {
    const { _version, ...withoutVersion } = data;

    if (!_version || _version <= this.version) {
      this.setLoaded();
      return;
    }

    this._data = data;
    this._data$.next(withoutVersion as D);
    this.setLoaded();
  }

  save(data: D, force = false): void {
    const file = this.file;
    if (!file) {
      console.warn("persistor omitted save because file is not resolved");
      return;
    }
    if (!this.loaded && !force) {
      console.warn("persistor omitted save because it is not loaded");
      return;
    }

    const { _version: currentVersion, ...currentData } = this._data ?? {};
    const sanitizedData = JSON.parse(JSON.stringify(data));
    const _diff = diff(currentData, sanitizedData);
    if (_.isEmpty(_diff)) {
      return;
    }
    const nextVersion = (currentVersion ?? 0) + 1;
    this._data = { ...sanitizedData, _version: nextVersion };
    // this.elll.contentManager.updateJsonContent(this.file.id, {
    //   ...sanitizedData,
    //   _version: nextVersion,
    // });
  }

  setLoaded(): void {
    if (this.loaded) {
      return;
    }
    setTimeout(() => {
      // allow ongoing operations to complete so we don't allow empty data to overwrite existing data
      // data sources can be debouced by ~500ms. A 1000ms delay allow empty data to be discarded before
      // we start the autosave process.
      if (!this.loaded) {
        this._loaded = true;
        this._loaded$.next(true);
      }
    }, 1000);
  }
}
