import _, { isArray } from "lodash";
import { useEffect, useReducer, useRef } from "react";
import { Observable, Subscription } from "rxjs";

export function useObservable<T, O extends Observable<T> | undefined>(
  ...args:
    | [observable: O, init: T, key?: any]
    | [[observable: O, init: T], key?: any]
): O extends undefined ? T | undefined : T {
  let observable: O;
  let init: T;
  let key: any;
  if (isArray(args[0])) {
    observable = args[0]?.[0];
    init = args[0]?.[1];
    key = args[1];
  } else {
    observable = args[0] as O;
    init = args[1];
    key = args[2];
  }
  const subscriptionRef = useRef<Subscription>();
  const keyRef = useRef(key);
  const valueRef = useRef(init);
  const [, update] = useReducer((s) => s + 1, 0);

  if (keyRef.current !== key) {
    keyRef.current = key;
    valueRef.current = init;
  }

  useEffect(() => {
    subscriptionRef.current?.unsubscribe();
    if (!observable) {
      if (valueRef.current !== undefined) {
        valueRef.current = undefined as any;
        update();
      }
      return;
    }
    subscriptionRef.current = observable.subscribe((value) => {
      if (!_.isEqual(value, valueRef.current)) {
        valueRef.current = value;
        update();
      }
    });

    return () => {
      subscriptionRef.current?.unsubscribe();
    };
  }, [key ?? observable]);

  return valueRef.current;
}

export function useManyObservables<T, O extends Observable<T> | undefined>(
  observables: O[],
  init: T[],
  key?: any,
): O extends undefined ? (T | undefined)[] : T[] {
  const observablesRef = useRef(observables);
  observablesRef.current = observables;
  const keyRef = useRef(key);
  const subscriptionsRef = useRef<Subscription[]>([]);
  const values = useRef(init);
  const [, update] = useReducer((s) => s + 1, 0);

  if (keyRef.current !== key) {
    keyRef.current = key;
    values.current = init;
  }

  useEffect(() => {
    const observables = observablesRef.current;
    for (let i = 0; i < observables.length; ++i) {
      const observable = observables[i];
      subscriptionsRef.current[i]?.unsubscribe();
      if (!observable) {
        values.current[i] = undefined as any;
        update();
        continue;
      }
      subscriptionsRef.current[i] = observable.subscribe((value) => {
        const newValues = [...values.current];
        newValues[i] = value;
        values.current = newValues;
        update();
      });
    }
    const subscriptions = subscriptionsRef.current;
    return () => {
      subscriptions.forEach((s) => s.unsubscribe());
    };
  }, [key]);

  return values.current;
}
