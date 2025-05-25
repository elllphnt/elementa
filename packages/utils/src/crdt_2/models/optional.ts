import { BehaviorSubject } from "rxjs";
import { Disposable } from "../../core/disposable.js";
import { CrdtModel, CrdtOf } from "./model.js";

export class OptionalCrdtModel<M extends CrdtModel<any>> extends Disposable {
  private _model$: BehaviorSubject<M | undefined>;

  get model(): M | undefined {
    return this._model$.value;
  }

  get model$() {
    return this._model$.asObservable();
  }

  constructor({
    crdt,
    create,
  }: {
    crdt: CrdtOf<M> | undefined;
    create: (crdt: CrdtOf<M>) => M;
  }) {
    super();

    const initial = crdt ? create(crdt) : undefined;
    this._model$ = new BehaviorSubject<M | undefined>(initial);

    this.addDisposer(() => {
      this._model$.value?.dispose();
      this._model$.complete();
    });
  }

  set(value: CrdtOf<M> | undefined, create: (v: CrdtOf<M>) => M) {
    this._model$.value?.dispose();
    this._model$.next(value ? create(value) : undefined);
  }

  clear() {
    this.set(undefined, () => undefined as any);
  }
}
