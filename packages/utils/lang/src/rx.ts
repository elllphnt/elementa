import { Observable, ObservableInputTuple, combineLatest, map, of } from "rxjs";

export function combineLatestOrEmpty<A extends readonly any[]>(
  observables: readonly [...ObservableInputTuple<A>]
): Observable<A> {
  if (observables.length === 0) {
    return of([]) as any as Observable<A>;
  } else {
    return combineLatest(observables);
  }
}
export function mapLatestOrEmpty<M extends Record<string, Observable<any>>>(
  observables: M
): Observable<{
  [K in keyof M]: M[K] extends Observable<infer T> ? T : never;
}> {
  return combineLatestOrEmpty(
    Object.entries(observables).map(([key, observable]) =>
      observable.pipe(map((value) => [key, value] as const))
    )
  ).pipe(map((entries) => Object.fromEntries(entries))) as any as Observable<{
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

export function combineLatestMerged<T extends object[]>(sources: {
  [K in keyof T]: Observable<T[K]>;
}): Observable<UnionToIntersection<T[number]>> {
  return combineLatest(sources).pipe(
    map(
      (values) => Object.assign({}, ...values) as UnionToIntersection<T[number]>
    )
  );
}

export function combineLatestArrays<T extends readonly unknown[][]>(sources: {
  [K in keyof T]: Observable<T[K]>;
}): Observable<Flatten<T>> {
  return combineLatest(sources).pipe(
    map((arrays) => arrays.flat() as Flatten<T>)
  );
}

// Utility to flatten tuple of arrays
type Flatten<T extends readonly unknown[][]> = T extends Array<infer U>
  ? U extends unknown[]
    ? [...U]
    : never
  : never;

// Utility to infer A & B from [A, B]
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : never;
