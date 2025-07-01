import { BehaviorSubject, Observable } from "rxjs";
import { Lifecycle } from "~/lifecycle.js";
import { State } from "../state/state.js";
import { ValueState } from "../state/value.js";
import { Model } from "./model.js";

export class OptionalModel<
  S extends State,
  M extends Model<S>
> extends Lifecycle {
  readonly state: ValueState<S | undefined>;
  private _model$ = new BehaviorSubject<M | undefined>(undefined);

  get model(): M | undefined {
    return this._model$.value;
  }
  get model$(): Observable<M | undefined> {
    return this._model$.asObservable();
  }

  constructor({
    state,
    create,
  }: {
    state: ValueState<S | undefined>;
    create: (entry: S, init?: boolean) => M;
  }) {
    super();

    this.state = state;
    this._model$ = new BehaviorSubject<M | undefined>(
      this.state.value ? create(this.state.value, true) : undefined
    );

    this.addInitializer(() => {
      const sub = this.state.value$.subscribe((value) => {
        const currentModel = this.model;

        if (value && currentModel && currentModel.state === value) {
          // Same value, keep existing model
          return;
        }

        // Dispose old model
        if (currentModel) {
          currentModel.dispose();
        }

        // Create new model if value exists
        const newModel = value ? create(value) : undefined;
        this._model$.next(newModel);
      });

      this.addDisposer(() => {
        sub.unsubscribe();
        this._model$.complete();
        this._model$.value?.dispose();
      });
    });

    this.addDisposer(() => {
      this.state.dispose();
      this._model$.value?.dispose();
    });
  }

  set(model: M | undefined): void {
    const currentModel = this._model$.value;

    // Dispose old model if it's different from the new one
    if (currentModel && currentModel !== model) {
      currentModel.dispose();
    }

    // update model first manually to ensure the same instance of model get reused during reconciliation.
    this._model$.next(model);
    // then update state
    this.state.setValue(model?.state);
  }

  clear(): void {
    const currentModel = this._model$.value;
    if (currentModel) {
      // update model first manually
      this._model$.next(undefined);
      // then update state
      this.state.setValue(undefined);
      // dispose the removed model
      currentModel.dispose();
    }
  }
}
