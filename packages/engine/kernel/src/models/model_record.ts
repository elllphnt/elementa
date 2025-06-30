import { BehaviorSubject, Observable } from "rxjs";
import { Lifecycle } from "~/lifecycle.js";
import { reconcileList } from "~/reconciliation.js";
import { RecordState } from "~/state/record.js";
import { State } from "../state/state.js";
import { Model } from "./model.js";

export class AggregatedModelRecord<
  S extends State,
  M extends Model<S>
> extends Lifecycle {
  readonly state: RecordState<Record<string, S>>;
  private _models$ = new BehaviorSubject<Record<string, M>>({});

  get models() {
    return this._models$.value as Record<string, M>;
  }
  get models$() {
    return this._models$.asObservable() as Observable<Record<string, M>>;
  }

  constructor({
    state,
    create,
  }: {
    state: RecordState<Record<string, S>>;
    create: (entry: S, key: string, init?: boolean) => M;
  }) {
    super();

    this.state = state;

    // Initialize models, filtering out undefined values
    const initialModels: Record<string, M> = {};
    for (const [key, entry] of Object.entries(this.state.record)) {
      if (entry) {
        initialModels[key] = create(entry, key, true);
      }
    }
    this._models$ = new BehaviorSubject<Record<string, M>>(initialModels);

    this.addInitializer(() => {
      const sub = this.state.record$.subscribe((record) => {
        // Transform records to arrays for reconcileList
        const sourceEntries = Object.entries(record)
          .filter(([, state]) => state !== undefined)
          .map(([key, state]) => ({ key, state: state! }));

        const targetEntries = Object.entries(this._models$.value).map(
          ([key, model]) => ({ key, model })
        );

        const [newEntries, removedEntries] = reconcileList({
          sources: sourceEntries,
          targets: targetEntries,
          sourceRef: (source) => source.state.key, // Use state.key for uniqueness
          targetRef: (target) => target.model.state.key, // Use state.key for uniqueness
          create: (source) => ({
            key: source.key,
            model: create(source.state, source.key),
          }),
        });

        // Transform back to record
        const nextModels: Record<string, M> = {};
        for (const entry of newEntries) {
          nextModels[entry.key] = entry.model;
        }

        this._models$.next(nextModels);

        // Dispose removed models
        removedEntries.forEach((entry) => entry.model.dispose());
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
    const currentModel = this.models[key];

    // Dispose old model if it exists and is different from the new one
    if (currentModel && currentModel !== model) {
      currentModel.dispose();
    }

    // update models list first manually to ensure the same instance of model get reused during reconciliation.
    const nextModels = { ...this._models$.value };
    if (model === undefined) {
      delete nextModels[key];
    } else {
      nextModels[key] = model;
    }
    this._models$.next(nextModels);

    // then update state
    this.state.set(key, model.state);
  }

  remove(key: string): void {
    const model = this.models[key];
    if (model) {
      // update models list first manually
      const nextModels = { ...this._models$.value };
      delete nextModels[key];
      this._models$.next(nextModels);
      // then update state
      this.state.remove(key);
      // dispose the removed model
      model.dispose();
    }
  }
}
