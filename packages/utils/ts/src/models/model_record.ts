import { BehaviorSubject } from "rxjs";
import { Lifecycle } from "../core/lifecycle.js";
import { reconcileMap } from "../core/reconciliation.js";
import { State } from "../state/state.js";
import { AggregatedStateRecord } from "../state/state_record.js";
import { Model } from "./model.js";

export class AggregatedModelRecord<
  S extends State,
  M extends Model<S>
> extends Lifecycle {
  readonly state: AggregatedStateRecord<S>;
  private _models$ = new BehaviorSubject<Record<string, M | undefined>>({});

  get models() {
    return this._models$.value;
  }
  get models$() {
    return this._models$.asObservable();
  }

  constructor({
    state,
    create,
  }: {
    state: AggregatedStateRecord<S>;
    create: (entry: S, key: string, init?: boolean) => M;
  }) {
    super();

    this.state = state;
    this._models$ = new BehaviorSubject<Record<string, M | undefined>>(
      Object.fromEntries(
        Object.entries(this.state.record).map(([key, entry]) => [
          key,
          entry ? create(entry, key, true) : undefined,
        ])
      )
    );

    this.addInitializer(() => {
      const sub = this.state.record$.subscribe((record) => {
        const [next, removed] = reconcileMap({
          sources: record,
          targets: this.models,
          create: (source, key) => {
            if (!source) {
              return undefined;
            }
            return create(source, key);
          },
        });

        this._models$.next(next);
        Object.values(removed).forEach((m) => m?.dispose());
      });

      this.addDisposer(() => {
        sub.unsubscribe();
        this._models$.complete();
        Object.values(this._models$.value).forEach((m) => m?.dispose());
      });
    });

    this.addDisposer(() => {
      this.state.dispose();
      Object.values(this._models$.value).forEach((m) => m?.dispose());
    });
  }

  set(key: string, model: M): void {
    // update models list first manually to ensure the same instance of model get reused during reconciliation.
    this._models$.next({
      ...this.models,
      [key]: model,
    });
    // then update state
    this.state.set(key, model.state);
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
