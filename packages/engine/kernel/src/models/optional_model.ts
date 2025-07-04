import type { Observable } from "rxjs";
import { BehaviorSubject } from "rxjs";
import { Lifecycle } from "~/lifecycle.js";
import type { State } from "../state/state.js";
import type { ValueState } from "../state/value.js";
import type { Model } from "./model.js";

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
    const initialModel = state.value ? create(state.value, true) : undefined;
    if (initialModel) {
      this.addLifecycle(initialModel);
    }
    this._model$ = new BehaviorSubject<M | undefined>(initialModel);

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
          this.removeLifecycle(currentModel);
        }

        // Create new model if value exists
        const newModel = value ? create(value) : undefined;
        if (newModel) {
          this.addLifecycle(newModel);
        }
        this._model$.next(newModel);
      });

      this.addDisposer(() => {
        sub.unsubscribe();
        this._model$.complete();
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
