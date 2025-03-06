import { BehaviorSubject, Observable, debounceTime, map } from "rxjs";
import { Backend } from "./backend";
import { Resource, ResourceFactory } from "./resource";
import { Disposable } from "@repo/utils";

export type Fetch = (_: { cursor?: string }) => Promise<{
  cursor?: string;
  hasMore?: boolean;
} | void>;

export interface IQuery<T> {
  fetching$: Observable<boolean>;
  fetching: boolean;
  error$: Observable<any | undefined>;
  error: any;
  hasMore$: Observable<boolean>;
  hasMore: boolean;
  data$: Observable<T>;
  fetch(): Promise<void>;
}
export class Query<M extends Resource, D> implements IQuery<D> {
  readonly key: string;
  readonly store: Store<M>;

  private _fetchCount = 0;

  private _fetching$ = new BehaviorSubject<boolean>(false);
  private _error$ = new BehaviorSubject<any | undefined>(undefined);

  private _cursor$ = new BehaviorSubject<any | undefined>(undefined);
  private _hasMore$ = new BehaviorSubject<boolean>(true);
  private _resolve$: (source: Observable<M[]>) => Observable<D>;
  private _resolve: (source: M[]) => D;
  private _fetch?: Fetch;

  get fetchCount() {
    return this._fetchCount;
  }

  get fetching$() {
    return this._fetching$.asObservable();
  }
  get fetching() {
    return this._fetching$.value;
  }

  get error$() {
    return this._error$.asObservable();
  }
  get error() {
    return this._error$.value;
  }

  get hasMore$() {
    return this._hasMore$.asObservable();
  }
  get hasMore() {
    return this._hasMore$.value;
  }

  get data$() {
    return this._resolve$(this.store.instances$);
  }
  get data() {
    return this._resolve(this.store.instances);
  }

  constructor({
    key,
    store,
    resolve$,
    resolve,
    fetch,
  }: {
    key: string;
    store: Store<M>;
    resolve$: (source: Observable<M[]>) => Observable<D>;
    resolve: (source: M[]) => D;
    fetch?: Fetch;
  }) {
    this.key = key;
    this.store = store;
    this._resolve$ = resolve$;
    this._resolve = resolve;
    this._fetch = fetch;
  }

  async fetch() {
    if (this.fetching || !this._fetch) return;
    try {
      this._fetching$.next(true);
      this._fetchCount++;
      const { cursor, hasMore } =
        (await this._fetch({
          cursor: this._cursor$.value,
        })) ?? {};
      this._cursor$.next(cursor);
      this._hasMore$.next(hasMore ?? true);
    } catch (error) {
      this._error$.next(error);
    } finally {
      setTimeout(() => {
        // allow for data to be dispatched before setting fetching to false
        this._fetching$.next(false);
      }, 100);
    }
  }
}

export class Store<R extends Resource = any> extends Disposable {
  readonly backend: Backend;
  readonly factory: ResourceFactory<R>;

  private _queries: Record<string, Query<R, any>> = {};
  private _instances$ = new BehaviorSubject<Record<string, R>>({});

  get instances$() {
    return this._instances$.asObservable().pipe(
      debounceTime(100),
      map((instances) => Object.values(instances)),
    );
  }
  get instances() {
    return Object.values(this._instances$.value);
  }

  private _initInstance(key: string) {
    const instance = new this.factory({
      backend: this.backend,
      id: key,
    });

    this._instances$.next({
      ...this._instances$.value,
      [key]: instance,
    });
    instance.fetch();
    return instance;
  }

  instance<C extends true | undefined>(
    id: string,
    create?: C,
  ): C extends true ? R : R | undefined {
    let instance = this._instances$.value[id];
    if (!instance && create) {
      instance = this._initInstance(id);
    }
    return instance;
  }

  query<D>({
    key,
    resolve$,
    resolve,
    fetch,
    autoFetch,
  }: {
    key: string;
    resolve$: (source: Observable<R[]>) => Observable<D>;
    resolve: (source: R[]) => D;
    fetch?: Fetch;
    autoFetch?: boolean;
  }): Query<R, D> {
    let query = this._queries[key];
    if (!query) {
      query = new Query({
        key,
        store: this,
        resolve$,
        resolve,
        fetch,
      });
      this._queries[key] = query;
    }

    if (autoFetch && !query.fetchCount) {
      query.fetch();
    }
    return query;
  }

  constructor({
    factory,
    backend,
  }: {
    backend: Backend;
    factory: ResourceFactory<R>;
  }) {
    super();
    this.backend = backend;
    this.factory = factory;

    this.addDisposer(() => {
      this._instances$.complete();
    });
  }

  push(data: Parameters<R["load"]>[0]) {
    let instance = this.instance(data.id);
    if (instance) {
      instance.load(data);
    } else {
      instance = new this.factory({
        backend: this.backend,
        id: data.id,
      });

      instance.load(data);
      this._instances$.next({
        ...this._instances$.value,
        [data.id]: instance,
      });
    }
    return instance;
  }
  remove(id: string) {
    const instance = this.instance(id);
    if (instance) {
      const newInstances = { ...this._instances$.value };
      delete newInstances[id];
      this._instances$.next(newInstances);
    }
  }
}
