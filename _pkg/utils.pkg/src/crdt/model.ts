import { BehaviorSubject, Observable } from "rxjs";
import * as y from "yjs";
import { Disposable } from "../core/disposable";

export class CRDTModel<D extends Record<string, any>> extends Disposable {
  readonly ymap: y.Map<any>;
  private readonly _value$ = new BehaviorSubject<D>({} as D);

  get value(): D {
    return this._value$.value;
  }
  get value$(): Observable<D> {
    return this._value$.asObservable();
  }

  constructor(ymap: y.Map<any>) {
    super();
    this.ymap = ymap;

    // Initialize with full map at start
    const initial: any = {};
    for (const [key, value] of this.ymap.entries()) {
      initial[key] = value;
    }
    this._value$.next(initial as D);

    // Live observe deltas
    const observer = (event: y.YMapEvent<any>) => {
      const current = { ...this._value$.value };

      for (const [key, change] of event.changes.keys.entries()) {
        if (change.action === "add" || change.action === "update") {
          const value = this.ymap.get(key);
          (current as any)[key] = value;
        } else if (change.action === "delete") {
          delete current[key];
        }
      }

      this._value$.next(current as D);
    };

    this.ymap.observe(observer);

    this.addDisposer(() => {
      this.ymap.unobserve(observer);
      this._value$.complete();
    });
  }

  transact(fn: () => void): void {
    const doc = this.ymap.doc;
    if (!doc) {
      throw new Error("Document is not initialized");
    }
    doc.transact(fn);
  }

  /** Replace full object */
  set(next: D): void {
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
  patch(patch: Partial<D>): void {
    this.transact(() => {
      for (const [key, value] of Object.entries(patch)) {
        this.ymap.set(key, value);
      }
    });
  }
}

export type CRDTModelDataType<M> = M extends CRDTModel<infer D> ? D : never;
