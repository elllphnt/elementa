import { BehaviorSubject } from "rxjs";
import { Lifecycle } from "../core/lifecycle.js";
import { reconcileList } from "../core/reconciliation.js";
import { ListState } from "../state/list.js";
import { State } from "../state/state.js";
import { Model } from "./model.js";

export class AggregatedModelList<
  S extends State,
  M extends Model<S>
> extends Lifecycle {
  readonly state: ListState<S>;
  private _models$ = new BehaviorSubject<M[]>([]);

  get models(): M[] {
    return this._models$.value;
  }
  get models$() {
    return this._models$.asObservable();
  }

  constructor({
    state,
    create,
  }: {
    state: ListState<S>;
    create: (entry: S, init?: boolean) => M;
  }) {
    super();

    this.state = state;
    this._models$ = new BehaviorSubject<M[]>(
      this.state.items.map((entry) => create(entry, true))
    );

    this.addInitializer(() => {
      const sub = this.state.items$.subscribe((items) => {
        const [next, removed] = reconcileList({
          sources: items,
          targets: this.models,
          sourceRef: (source) => source, // Use the source object itself as ref
          targetRef: (target) => target.state, // Use the model's source as ref
          create: (source) => create(source),
        });

        this._models$.next(next);
        removed.forEach((m) => m.dispose());
      });

      this.addDisposer(() => {
        sub.unsubscribe();
        this._models$.complete();
        this._models$.value.forEach((m) => m.dispose());
      });
    });

    this.addDisposer(() => {
      this.state.dispose();
      this._models$.value.forEach((m) => m.dispose());
    });
  }

  set(index: number, model: M): void {
    // update models list first manually to ensure the same instance of model get reused during reconciliation.
    const nextModels = [...this.models];
    nextModels[index] = model;
    this._models$.next(nextModels);
    // then update state
    const nextItems = [...this.state.items];
    nextItems[index] = model.state;
    this.state.setItems(nextItems);
  }

  add(model: M): void {
    // update models list first manually
    this._models$.next([...this.models, model]);
    // then update state
    this.state.add(model.state);
  }

  insertAt(index: number, models: M[]): void {
    // update models list first manually
    const nextModels = [...this.models];
    nextModels.splice(index, 0, ...models);
    this._models$.next(nextModels);
    // then update state
    this.state.insertAt(
      index,
      models.map((m) => m.state)
    );
  }

  append(models: M[]): void {
    // update models list first manually
    this._models$.next([...this.models, ...models]);
    // then update state
    this.state.append(models.map((m) => m.state));
  }

  prepend(models: M[]): void {
    // update models list first manually
    this._models$.next([...models, ...this.models]);
    // then update state
    this.state.prepend(models.map((m) => m.state));
  }

  remove(predicate: (model: M) => boolean): void {
    const toRemove = this.models.filter(predicate);
    if (toRemove.length > 0) {
      // update models list first manually
      const nextModels = this.models.filter((m) => !predicate(m));
      this._models$.next(nextModels);
      // then update state
      this.state.remove((source) =>
        toRemove.some((model) => model.state === source)
      );
      // dispose removed models
      toRemove.forEach((m) => m.dispose());
    }
  }

  removeAt(index: number, count: number = 1): void {
    const toRemove = this.models.slice(index, index + count);
    if (toRemove.length > 0) {
      // update models list first manually
      const nextModels = [...this.models];
      nextModels.splice(index, count);
      this._models$.next(nextModels);
      // then update state
      this.state.removeAt(index, count);
      // dispose removed models
      toRemove.forEach((m) => m.dispose());
    }
  }
}
