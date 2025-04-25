import { Observable, ObservableInputTuple, combineLatest, of } from "rxjs";

export function combineLatestOrEmpty<A extends readonly unknown[]>(
  observables: readonly [...ObservableInputTuple<A>],
): Observable<A> {
  if (observables.length === 0) {
    return of([]) as unknown as Observable<A>;
  } else {
    return combineLatest(observables);
  }
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
