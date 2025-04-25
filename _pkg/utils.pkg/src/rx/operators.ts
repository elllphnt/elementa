import { Observable, ObservableInputTuple, combineLatest, map, of } from "rxjs";

export function combineLatestOrEmpty<A extends readonly unknown[]>(
  observables: readonly [...ObservableInputTuple<A>],
): Observable<A> {
  if (observables.length === 0) {
    return of([]) as unknown as Observable<A>;
  } else {
    return combineLatest(observables);
  }
}
export function mapLatestOrEmpty<M extends Record<string, Observable<any>>>(
  observables: M,
): Observable<{
  [K in keyof M]: M[K] extends Observable<infer T> ? T : never;
}> {
  return combineLatestOrEmpty(
    Object.entries(observables).map(([key, observable]) =>
      observable.pipe(map((value) => [key, value] as const)),
    ),
  ).pipe(
    map((entries) => Object.fromEntries(entries)),
  ) as unknown as Observable<{
    [K in keyof M]: M[K] extends Observable<infer T> ? T : never;
  }>;
}
export function pairwiseOrEmpty<T>() {
  return function (source: Observable<T>) {
    return new Observable<[T | undefined, T]>((subscriber) => {
      let prev: T | undefined;
      const sub = source.subscribe((value) => {
        const p = prev;
        prev = value;
        subscriber.next([p, value]);
      });
      return () => {
        prev = undefined;
        sub.unsubscribe();
      };
    });
  };
}
