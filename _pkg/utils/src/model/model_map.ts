// utils.pkg/src/rx/reactive_model_map.ts

import { Observable, of } from "rxjs";
import { map, switchMap } from "rxjs/operators";
import { ReactiveMap } from "../rx/map";
import { combineLatestOrEmpty } from "../rx/operators";
import { IModel } from "./model";

export class ReactiveModelMap<D, M extends IModel<D>> extends ReactiveMap<M> {
  private readonly createModel: (data: D) => M;

  constructor({ createModel }: { createModel: (data: D) => M }) {
    super();
    this.createModel = createModel;
  }

  /** Snapshot of raw data for each model */
  get data(): Record<string, D> {
    const out: Record<string, D> = {};
    for (const [key, model] of Object.entries(this.items)) {
      out[key] = model.data;
    }
    return out;
  }

  /** Reactive stream of raw data maps */
  get data$(): Observable<Record<string, D>> {
    return this.items$.pipe(
      switchMap((itemsMap) => {
        const entries = Object.entries(itemsMap);
        if (entries.length === 0) return of({});

        return combineLatestOrEmpty(
          entries.map(([key, model]) =>
            model.data$.pipe(map((data) => [key, data] as const)),
          ),
        ).pipe(map((entries) => Object.fromEntries(entries)));
      }),
    );
  }

  /**
   * Reconcile the model map against raw data.
   * - Reuses models by `identifyModel(model)` matching the incoming key
   * - Creates new models via `createModel(data)`
   * - Disposes old models no longer present
   */
  restore(data: Record<string, D> = {}): void {
    this.reconcile<D>({
      sources: data,
      create: (raw) => this.createModel(raw),
      reconcile: (model, raw) => model.restore(raw),
      dispose: (model) => model.dispose(),
    });
  }
}
