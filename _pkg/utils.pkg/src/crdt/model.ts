import { BehaviorSubject, Observable } from "rxjs";
import * as y from "yjs";
import { Disposable } from "../core/disposable";

export class CRDTModel<S extends Record<string, any>> extends Disposable {
  static key = Math.round(Math.random() * 100000);
  key = CRDTModel.key++;

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

  getOrCreateMap(key: keyof S): y.Map<any> {
    let map = this.ymap.get(key as string);
    if (!map) {
      map = new y.Map();
      this.ymap.set(key as string, map);
    }
    return map;
  }
  getOrCreateArray(key: keyof S): y.Array<any> {
    let array = this.ymap.get(key as string);
    if (!array) {
      array = new y.Array();
      this.ymap.set(key as string, array);
    }
    return array;
  }
  getOrCreateText(key: keyof S): y.Text {
    let text = this.ymap.get(key as string);
    if (!text) {
      text = new y.Text();
      this.ymap.set(key as string, text);
    }
    return text;
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

export type CRDTModelDataType<M> = M extends CRDTModel<infer D> ? D : never;
