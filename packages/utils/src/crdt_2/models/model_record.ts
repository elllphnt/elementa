import { BehaviorSubject } from "rxjs";
import * as y from "yjs";
import { Disposable } from "../../core/disposable.js";
import { reconcileMap } from "../../core/reconciliation.js";
import { CrdtRecordState } from "../record.js";
import { CrdtModel, CrdtOf } from "./model.js";

export class AggregatedCrdtModelRecord<
  M extends CrdtModel<any>
> extends Disposable {
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
    create: (entry: CrdtOf<M>, key: string, init?: boolean) => M;
  }) {
    super();

    this.state = new CrdtRecordState(crdt);
    this._models$ = new BehaviorSubject<Record<string, M>>(
      Object.fromEntries(
        Object.entries(this.state.record).map(([key, entry]) => [
          key,
          create(entry, key, true),
        ])
      )
    );

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

  set(key: string, model: M): void {
    // update models list first manually to ensure the same instance of model get reused during reconciliation.
    this._models$.next({
      ...this.models,
      [key]: model,
    });
    // then update state
    this.state.set(key, model.crdt as any);
  }

  remove(key: string): void {
    const model = this.models[key];
    if (model) {
      // update models list first manually
      const nextModels = { ...this.models };
      delete nextModels[key];
      this._models$.next(nextModels);
      // then update state
      this.state.remove(key);
      // dispose the removed model
      model.dispose();
    }
  }
}
