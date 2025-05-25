import { BehaviorSubject } from "rxjs";
import * as y from "yjs";
import { reconcileList } from "../../core/reconciliation.js";
import { CrdtListState } from "../list.js";
import { CrdtModel, CrdtOf } from "./model.js";

export class AggregatedCrdtModelList<
  M extends CrdtModel<y.AbstractType<any>>
> extends CrdtModel<y.Array<CrdtOf<M>>> {
  readonly state: CrdtListState<CrdtOf<M>>;

  private _models$ = new BehaviorSubject<M[]>([]);

  get models() {
    return this._models$.value;
  }
  get models$() {
    return this._models$.asObservable();
  }

  constructor({
    crdt,
    create,
  }: {
    crdt: y.Array<CrdtOf<M>>;
    create: (type: CrdtOf<M>) => M;
  }) {
    super({ crdt });

    this.state = new CrdtListState(crdt);
    const itemsSubscription = this.state.items$.subscribe((items) => {
      const [nextModels, toRemove] = reconcileList({
        sources: items,
        targets: this.models,
        sourceRef: (r) => r,
        targetRef: (m) => m.crdt,
        create: (type) => create(type),
      });
      this._models$.next(nextModels);
      toRemove.forEach((r) => r.dispose());
    });

    this.addDisposer(() => {
      this.state.dispose();
      itemsSubscription.unsubscribe();
    });
  }

  add(models: M[]) {
    // update models list first manually to ensure the same instance of model get reused during reconcialiation.
    this._models$.next([...this.models, ...models]);
    // then update state
    this.state.append(models.map((m) => m.crdt as any));
  }
  insert(index: number, models: M[]) {
    // update models list first manually to ensure the same instance of model get reused during reconcialiation.
    const nextModels = [...this.models];
    nextModels.splice(index, 0, ...models);
    this._models$.next(nextModels);
    // then update state
    this.state.insertAt(
      index,
      models.map((m) => m.crdt as any)
    );
  }
  remove(models: M[]) {
    const crdts = new Set(models.map((m) => m.crdt as any));
    this.state.remove((c) => crdts.has(c));
  }
}
