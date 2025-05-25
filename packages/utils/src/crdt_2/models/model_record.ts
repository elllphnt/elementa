import { BehaviorSubject } from "rxjs";
import * as y from "yjs";
import { reconcileMap } from "../../core/reconciliation.js";
import { CrdtRecordState } from "../record.js";
import { CrdtModel, CrdtOf } from "./model.js";

export class AggregatedCrdtModelRecord<
  M extends CrdtModel<any>
> extends CrdtModel<y.Map<CrdtOf<M>>> {
  readonly state: CrdtRecordState<Record<string, CrdtOf<M>>>;

  private _models$ = new BehaviorSubject<Record<string, M>>({});

  get models(): Record<string, M> {
    return this._models$.value;
  }

  get models$() {
    return this._models$.asObservable();
  }

  constructor({
    crdt,
    create,
  }: {
    crdt: y.Map<CrdtOf<M>>;
    create: (entry: CrdtOf<M>, key: string) => M;
  }) {
    super({ crdt });

    this.state = new CrdtRecordState(crdt);

    const sub = this.state.record$.subscribe((record) => {
      const [next, removed] = reconcileMap({
        sources: record,
        targets: this.models,
        create,
      });

      this._models$.next(next);
      Object.values(removed).forEach((m) => m.dispose());
    });

    this.addDisposer(() => {
      sub.unsubscribe();
      this.state.dispose();
      Object.values(this._models$.value).forEach((m) => m.dispose());
    });
  }
}
