// utils.pkg/src/rx/crdt_model_list.ts
import { BehaviorSubject, map, Observable } from "rxjs";
import * as y from "yjs";
import { Disposable } from "../core/disposable";
import { MapCRDTModel } from "./map";

export class CRDTModelList<M extends MapCRDTModel<any>> extends Disposable {
  static key = Math.round(Math.random() * 100000);
  key = CRDTModelList.key++;

  private readonly yarray: y.Array<y.Map<any>>;
  private readonly createModel: (ymap: y.Map<any>) => M;
  private readonly _items$ = new BehaviorSubject<M[]>([]);

  get items(): M[] {
    return this._items$.getValue();
  }
  get items$(): Observable<M[]> {
    return this._items$.asObservable();
  }

  itemOf(ymap: y.Map<any>): M | undefined {
    return this.items.find((model) => model.ymap === ymap);
  }
  itemOf$(ymap: y.Map<any>): Observable<M | undefined> {
    return this.items$.pipe(
      map((items) => {
        return items.find((model) => model.ymap === ymap);
      })
    );
  }

  constructor(
    yarray: y.Array<y.Map<any>>,
    createModel: (ymap: y.Map<any>) => M
  ) {
    super();
    this.yarray = yarray;
    this.createModel = createModel;

    // Initialize with full array at start
    const initial: M[] = [];
    for (const ymap of this.yarray.toArray()) {
      const model = this.createModel(ymap);
      initial.push(model);
    }
    this._items$.next(initial);

    // Live observe deltas
    const observer = (event: y.YArrayEvent<any>) => {
      const newItems = [...this.items];
      const removed: M[] = [];
      let index = 0;
      for (const op of event.changes.delta) {
        if (op.retain) {
          index += op.retain;
        } else if (op.delete) {
          removed.push(...newItems.splice(index, op.delete));
        } else if (op.insert) {
          const maps = op.insert as y.Map<any>[];
          const models = maps.map((ymap) => this.createModel(ymap));
          removed.push(...newItems.splice(index, 0, ...models));
          index += models.length;
        }
      }
      this._items$.next(newItems);
      for (const model of removed) {
        model.dispose();
      }
    };

    this.yarray.observe(observer);

    this.addDisposer(() => {
      this.yarray.unobserve(observer);
      this._items$.complete();
      for (const model of this.items) {
        model.dispose();
      }
    });
  }

  transact(fn: () => void): void {
    if (!this.yarray.doc) {
      throw new Error("Document is not initialized");
    }
    this.yarray.doc.transact(fn);
  }

  add(...items: y.Map<any>[]) {
    if (items.length === 0) {
      return [];
    }
    this.yarray.push(items);
  }
  insertAt(index: number, ...items: y.Map<any>[]) {
    if (items.length === 0) {
      return [];
    }
    this.yarray.insert(index, items);
  }

  removeAt(index: number, length?: number): void {
    this.yarray.delete(index, length);
  }
  remove(item: M): void {
    const index = this.items.findIndex((model) => model === item);
    if (index >= 0) {
      this.removeAt(index);
    }
  }

  clear(): void {
    this.yarray.delete(0, this.yarray.length);
  }
}
