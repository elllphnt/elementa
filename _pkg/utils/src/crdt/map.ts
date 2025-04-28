import { BehaviorSubject, Observable } from "rxjs";
import * as y from "yjs";
import { Disposable } from "../core/disposable";
import { getOrCreateYArray, getOrCreateYMap, getOrCreateYText } from "./_utils";

export class MapCRDTModel<S extends Record<string, any>> extends Disposable {
  static key = Math.round(Math.random() * 100000);
  key = MapCRDTModel.key++;

  readonly ymap: y.Map<any>;
  private readonly _state$ = new BehaviorSubject<S>({} as S);

  get state(): S {
    return this._state$.value;
  }
  get state$(): Observable<S> {
    return this._state$.asObservable();
  }

  constructor(ymap: y.Map<any>) {
    super();
    this.ymap = ymap;

    // Initialize with full map at start
    const initial: any = {};
    for (const [key, value] of this.ymap.entries()) {
      initial[key] = value;
    }
    this._state$.next(initial as S);

    // Live observe deltas
    const observer = (event: y.YMapEvent<any>) => {
      const current = { ...this._state$.value };

      for (const [key, change] of event.changes.keys.entries()) {
        if (change.action === "add" || change.action === "update") {
          const value = this.ymap.get(key);
          (current as any)[key] = value;
        } else if (change.action === "delete") {
          delete current[key];
        }
      }

      this._state$.next(current as S);
    };

    this.ymap.observe(observer);

    this.addDisposer(() => {
      this.ymap.unobserve(observer);
      this._state$.complete();
    });
  }

  getOrCreateMap<T>(key: keyof S, init?: Record<string, T>): y.Map<T> {
    return getOrCreateYMap(this.ymap, key as string, init);
  }
  getOrCreateArray<T>(key: keyof S): y.Array<T> {
    return getOrCreateYArray(this.ymap, key as string);
  }
  getOrCreateText(key: keyof S, init?: string): y.Text {
    return getOrCreateYText(this.ymap, key as string, init);
  }

  transact(fn: () => void): void {
    const doc = this.ymap.doc;
    if (!doc) {
      throw new Error("Document is not initialized");
    }
    doc.transact(fn);
  }

  /** Replace full object */
  set(next: S): void {
    this.transact(() => {
      for (const key of Array.from(this.ymap.keys())) {
        if (!(key in next)) {
          this.ymap.delete(key);
        }
      }
      for (const [key, value] of Object.entries(next)) {
        this.ymap.set(key, value);
      }
    });
  }

  /** Patch partial fields */
  patch(patch: Partial<S>): void {
    this.transact(() => {
      for (const [key, value] of Object.entries(patch)) {
        this.ymap.set(key, value);
      }
    });
  }
}

export type CRDTModelDataType<M> = M extends MapCRDTModel<infer D> ? D : never;
