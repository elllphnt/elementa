import { isStaticReference, Resolvable } from "@elllphnt/elementa-base";
import { Disposable } from "@elllphnt/elementa-utils";
import {
  BehaviorSubject,
  forkJoin,
  from,
  Observable,
  of,
  Subscription,
} from "rxjs";
import {
  catchError,
  distinctUntilChanged,
  finalize,
  map,
  switchMap,
  tap,
} from "rxjs/operators";
import { Infrastructure } from "../infrastructure/infrastructure";

export interface ResolvableValueState<T> {
  value?: T;
  resolvingCount: number;
  isResolved: boolean;
}

export class ResolvableValue<T> extends Disposable {
  private _input$ = new BehaviorSubject<Resolvable<T | undefined>>(
    undefined as T | undefined
  );
  private _state$ = new BehaviorSubject<ResolvableValueState<T>>({
    value: undefined,
    resolvingCount: 0,
    isResolved: false,
  });

  public readonly state$: Observable<ResolvableValueState<T>> =
    this._state$.asObservable();

  constructor(init: Resolvable<T>, private infra: Infrastructure) {
    super();
    this._input$.next(init);

    const subscription = this._input$
      .pipe(
        distinctUntilChanged(),
        tap(() => {
          const prev = this._state$.getValue();
          this._state$.next({
            ...prev,
            resolvingCount: prev.resolvingCount + 1,
            isResolved: false,
          });
        }),
        switchMap((resolvable) =>
          (isStaticReference(resolvable)
            ? from(this.infra.resolveStaticReference<T>(resolvable))
            : of(resolvable as unknown as T)
          ).pipe(
            tap((resolved) => {
              const prev = this._state$.getValue();
              this._state$.next({ ...prev, value: resolved, isResolved: true });
            }),
            catchError((error) => {
              console.error("ResolvableValue: error resolving value", error);
              const prev = this._state$.getValue();
              this._state$.next({
                ...prev,
                value: undefined,
                isResolved: false,
              });
              return of(undefined as T);
            }),
            finalize(() => {
              const prev = this._state$.getValue();
              this._state$.next({
                ...prev,
                resolvingCount: prev.resolvingCount - 1,
              });
            })
          )
        )
      )
      .subscribe();

    this.addDisposer(() => {
      subscription.unsubscribe();
      this._input$.complete();
      this._state$.complete();
    });
  }

  setValue(resolvable: Resolvable<T>): void {
    this._input$.next(resolvable);
  }

  subscribe(input$: Observable<Resolvable<T>>) {
    return input$.subscribe((value) => this.setValue(value));
  }

  get value(): T | undefined {
    return this._state$.getValue().value;
  }

  get resolvingCount(): number {
    return this._state$.getValue().resolvingCount;
  }

  get isResolving(): boolean {
    return this.resolvingCount > 0;
  }

  get isResolved(): boolean {
    return this._state$.getValue().isResolved;
  }
}

export interface ResolvableRecordState<V> {
  value: Record<string, V | undefined>;
  resolvingCount: number;
  isResolved: boolean;
}

export class ResolvableRecord<V> extends Disposable {
  private _input$ = new BehaviorSubject<Record<string, Resolvable<V>>>({});
  private _state$ = new BehaviorSubject<ResolvableRecordState<V>>({
    value: {},
    resolvingCount: 0,
    isResolved: false,
  });
  private _subscription?: Subscription;

  public readonly state$: Observable<ResolvableRecordState<V>> =
    this._state$.asObservable();

  constructor(
    initRecord: Record<string, Resolvable<V>>,
    private infra: Infrastructure
  ) {
    super();
    this._input$.next(initRecord);

    this._subscription = this._input$
      .pipe(
        distinctUntilChanged((a, b) => shallowEqual(a, b)),
        tap(() => {
          const prev = this._state$.getValue();
          this._state$.next({
            ...prev,
            resolvingCount: prev.resolvingCount + 1,
            isResolved: false,
          });
        }),
        switchMap((record) => {
          const observables: Record<string, Observable<V | undefined>> = {};
          for (const key in record) {
            const value = record[key];
            observables[key] = (
              isStaticReference(value)
                ? from(this.infra.resolveStaticReference<V>(value))
                : of(value as unknown as V)
            ).pipe(
              catchError((error) => {
                console.error(
                  "ResolvableRecord: error resolving key",
                  key,
                  error
                );
                return of(undefined as V);
              })
            );
          }
          return forkJoin(observables).pipe(
            tap((resolvedRecord) => {
              const prev = this._state$.getValue();
              this._state$.next({
                value: resolvedRecord,
                resolvingCount: prev.resolvingCount,
                isResolved: true,
              });
            }),
            finalize(() => {
              const prev = this._state$.getValue();
              this._state$.next({
                ...prev,
                resolvingCount: prev.resolvingCount - 1,
              });
            })
          );
        })
      )
      .subscribe();

    this.addDisposer(() => {
      this._subscription?.unsubscribe();
      this._input$.complete();
      this._state$.complete();
    });
  }

  setRecord(record: Record<string, Resolvable<V>>): void {
    this._input$.next(record);
  }

  subscribe(input$: Observable<Record<string, Resolvable<V>>>) {
    return input$.subscribe((record) => this.setRecord(record));
  }

  value$ = this._state$.pipe(map((s) => s.value));
  get value(): Record<string, V | undefined> {
    return this._state$.getValue().value;
  }

  resolvingCount$ = this._state$.pipe(map((s) => s.resolvingCount));
  get resolvingCount(): number {
    return this._state$.getValue().resolvingCount;
  }

  isResolving$ = this._state$.pipe(map((s) => s.resolvingCount > 0));
  get isResolving(): boolean {
    return this.resolvingCount > 0;
  }

  get isResolved(): boolean {
    return this._state$.getValue().isResolved;
  }
}

export interface ResolvableListState<V> {
  value: Array<V | undefined>;
  resolvingCount: number;
  isResolved: boolean;
}

export class ResolvableList<V> extends Disposable {
  private _input$ = new BehaviorSubject<Array<Resolvable<V>>>([]);
  private _state$ = new BehaviorSubject<ResolvableListState<V>>({
    value: [],
    resolvingCount: 0,
    isResolved: false,
  });
  private _subscription?: Subscription;

  public readonly state$: Observable<ResolvableListState<V>> =
    this._state$.asObservable();

  constructor(initList: Array<Resolvable<V>>, private infra: Infrastructure) {
    super();
    this._input$.next(initList);

    this._subscription = this._input$
      .pipe(
        distinctUntilChanged((a, b) => shallowArrayEqual(a, b)),
        tap(() => {
          const prev = this._state$.getValue();
          this._state$.next({
            ...prev,
            resolvingCount: prev.resolvingCount + 1,
            isResolved: false,
          });
        }),
        switchMap((list) => {
          const observables = list.map((item) =>
            (isStaticReference(item)
              ? from(this.infra.resolveStaticReference<V>(item))
              : of(item as unknown as V)
            ).pipe(
              catchError((error) => {
                console.error("ResolvableList: error resolving item", error);
                return of(undefined as V);
              })
            )
          );
          return forkJoin(observables).pipe(
            tap((resolvedList) => {
              const prev = this._state$.getValue();
              this._state$.next({
                value: resolvedList,
                resolvingCount: prev.resolvingCount,
                isResolved: true,
              });
            }),
            finalize(() => {
              const prev = this._state$.getValue();
              this._state$.next({
                ...prev,
                resolvingCount: prev.resolvingCount - 1,
              });
            })
          );
        })
      )
      .subscribe();

    this.addDisposer(() => {
      this._subscription?.unsubscribe();
      this._input$.complete();
      this._state$.complete();
    });
  }

  setList(list: Array<Resolvable<V>>): void {
    this._input$.next(list);
  }

  subscribe(input$: Observable<Array<Resolvable<V>>>) {
    return input$.subscribe((list) => this.setList(list));
  }

  get value(): Array<V | undefined> {
    return this._state$.getValue().value;
  }

  get resolvingCount(): number {
    return this._state$.getValue().resolvingCount;
  }

  get isResolving(): boolean {
    return this.resolvingCount > 0;
  }

  get isResolved(): boolean {
    return this._state$.getValue().isResolved;
  }
}

function shallowEqual(
  a: Record<string, unknown>,
  b: Record<string, unknown>
): boolean {
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  for (const key of keysA) {
    if (a[key] !== b[key]) return false;
  }
  return true;
}

function shallowArrayEqual(a: Array<unknown>, b: Array<unknown>): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}
