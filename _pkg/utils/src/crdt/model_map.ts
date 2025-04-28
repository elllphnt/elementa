// utils.pkg/src/rx/crdt_model_map.ts
import { BehaviorSubject, map, Observable } from "rxjs";
import * as y from "yjs";
import { Disposable } from "../core/disposable";
import { MapCRDTModel } from "./map";

export class CRDTModelMap<M extends MapCRDTModel<any>> extends Disposable {
  static key = Math.round(Math.random() * 100000);
  key = CRDTModelMap.key++;

  private readonly ymap: y.Map<y.Map<any>>;
  private readonly createModel: (ymap: y.Map<any>) => M;
  private readonly _items$ = new BehaviorSubject<Record<string, M>>({});

  get items(): Record<string, M> {
    return this._items$.getValue();
  }

  get items$(): Observable<Record<string, M>> {
    return this._items$.asObservable();
  }

  item(key: string): M | undefined {
    return this.items[key];
  }

  item$(key: string): Observable<M | undefined> {
    return this.items$.pipe(map((items) => items[key]));
  }

  constructor(ymap: y.Map<y.Map<any>>, createModel: (ymap: y.Map<any>) => M) {
    super();
    this.ymap = ymap;
    this.createModel = createModel;

    // Initialize with full map at start
    const initial: Record<string, M> = {};
    for (const [key, ymap] of this.ymap.entries()) {
      const model = this.createModel(ymap);
      initial[key] = model;
    }
    this._items$.next(initial);

    // Live observe deltas
    const observer = (event: y.YMapEvent<any>) => {
      const newItems = { ...this.items };
      const removed: M[] = [];

      for (const [key, change] of event.changes.keys.entries()) {
        if (change.action === "delete") {
          const model = newItems[key];
          if (model) {
            removed.push(model);
            delete newItems[key];
          }
        } else if (change.action === "add" || change.action === "update") {
          const ymap = this.ymap.get(key);
          if (ymap) {
            const model = this.createModel(ymap);
            const old = newItems[key];
            if (old) {
              removed.push(old);
            }
            newItems[key] = model;
          }
        }
      }

      this._items$.next(newItems);

      for (const model of removed) {
        model.dispose();
      }
    };

    this.ymap.observe(observer);

    this.addDisposer(() => {
      this.ymap.unobserve(observer);
      this._items$.complete();
      for (const model of Object.values(this.items)) {
        model.dispose();
      }
    });
  }

  transact(fn: () => void): void {
    if (!this.ymap.doc) {
      throw new Error("Document is not initialized");
    }
    this.ymap.doc.transact(fn);
  }

  /** Set a new model by key, accepts either a y.Map or plain data */
  set(key: string, init: y.Map<any> | Record<string, any>): void {
    this.transact(() => {
      const map =
        init instanceof y.Map ? init : new y.Map<any>(Object.entries(init));
      this.ymap.set(key, map);
    });
  }

  /** Delete an existing model */
  delete(key: string): void {
    this.ymap.delete(key);
  }

  /** Clear all models */
  clear(): void {
    this.transact(() => {
      for (const key of Array.from(this.ymap.keys())) {
        this.ymap.delete(key);
      }
    });
  }
}
