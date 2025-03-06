import * as _ from "lodash";
import {
  BehaviorSubject,
  debounceTime,
  distinctUntilChanged,
  filter,
  first,
  Observable,
} from "rxjs";
import { Backend } from "./backend";
import { makeElllResourceUrl } from "./url";
import { Disposable } from "@repo/utils";

export type ResourceData = {
  id: string;
  entity: string;
};
export abstract class Resource<
  D extends ResourceData = ResourceData,
> extends Disposable {
  readonly id: string;
  readonly entity: string;
  readonly backend: Backend;

  updatedAt: Date | undefined;

  protected _fetching$ = new BehaviorSubject<boolean>(false);
  protected _loaded$ = new BehaviorSubject<boolean>(false);
  protected _error$ = new BehaviorSubject<any | undefined>(undefined);
  protected _notFound$ = new BehaviorSubject<boolean>(false);

  get url() {
    return makeElllResourceUrl(this.id);
  }

  get fetching$() {
    return this._fetching$.asObservable();
  }
  get fetching() {
    return this._fetching$.value;
  }
  get loaded$() {
    return this._loaded$.asObservable().pipe(distinctUntilChanged());
  }
  get loaded() {
    return this._loaded$.value;
  }
  get error$() {
    return this._error$.asObservable();
  }
  get error() {
    return this._error$.value;
  }
  get notFound$() {
    return this._notFound$.asObservable();
  }
  get notFound() {
    return this._notFound$.value;
  }

  untilLoaded() {
    return new Promise<void>((resolve) => {
      this.loaded$
        .pipe(
          filter((loaded) => loaded),
          first(),
        )
        .subscribe(() => {
          resolve();
        });
    });
  }

  constructor({
    id,
    entity,
    backend,
  }: {
    id: string;
    entity: string;
    backend: Backend;
  }) {
    super();
    this.id = id;
    this.entity = entity;
    this.backend = backend;

    this.addDisposer(() => {
      this._fetching$.complete();
      this._loaded$.complete();
      this._error$.complete();
    });
  }

  load(data: D) {
    const updatedAtString = (data as any).updatedAt;
    const updatedAt = updatedAtString ? new Date(updatedAtString) : undefined;

    if (updatedAt && this.updatedAt && updatedAt <= this.updatedAt) {
      return;
    }

    this.loadData(data);
    if (!this.loaded) {
      this._loaded$.next(true);
    }

    this.updatedAt = updatedAt;
  }
  protected abstract loadData(data: D): void;

  async fetch() {
    try {
      this._fetching$.next(true);
      await this.fetchData();
    } catch (error) {
      this._error$.next(error);
    } finally {
      this._fetching$.next(false);
    }
  }

  setNotFound() {
    this._notFound$.next(true);
  }

  protected abstract fetchData(): Promise<void>;
}

export abstract class SavableResource<
  D extends ResourceData = ResourceData,
> extends Resource<D> {
  protected _saving$ = new BehaviorSubject<number>(0);

  get saving$() {
    return this._saving$.asObservable();
  }
  get saving() {
    return this._saving$.value;
  }

  constructor({
    id,
    entity,
    backend,
  }: {
    id: string;
    entity: string;
    backend: Backend;
  }) {
    super({ id, entity, backend });
    this.addDisposer(() => {
      this._saving$.complete();
    });
  }

  async save() {
    this._saving$.next(this._saving$.value + 1);
    try {
      await this.saveData();
    } finally {
      this._saving$.next(Math.max(0, this._saving$.value - 1));
    }
  }
  protected abstract saveData(): Promise<void>;
}

export abstract class AutoSavableResource<
  D extends ResourceData = ResourceData,
> extends SavableResource<D> {
  abstract get changes$(): Observable<any>;

  constructor({
    id,
    entity,
    backend,
  }: {
    id: string;
    entity: string;
    backend: Backend;
  }) {
    super({
      id,
      entity,
      backend,
    });

    this.addDisposer(() => {
      this._saving$.complete();
    });
  }

  async watchChanges() {
    const changeSubscription = this.changes$
      .pipe(distinctUntilChanged(_.isEqual), debounceTime(1000))
      .subscribe(() => {
        this.save();
      });

    this.addDisposer(() => {
      changeSubscription.unsubscribe();
    });
  }

  load(data: D): void {
    if (this.saving) {
      return;
    } else {
      super.load(data);
    }
  }
}

export type ResourceFactory<R extends Resource = Resource> = {
  entity: string;
  new ({ id, backend }: { id: string; backend: Backend }): R;
};
