import { useEffect, useReducer, useRef } from "react";
import { Observable, Subscription } from "rxjs";

/**
 * High-performance deep equality check between two values.
 */
function isEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a == null || b == null) return a === b;
  if (a.constructor !== (b as Record<string, unknown>).constructor)
    return false;

  if (Array.isArray(a)) {
    const arrB = b as unknown[];
    if (arrB.length !== a.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!isEqual(a[i], arrB[i])) return false;
    }
    return true;
  }

  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === (b as Date).getTime();
  }

  if (a instanceof RegExp && b instanceof RegExp) {
    return a.source === (b as RegExp).source && a.flags === (b as RegExp).flags;
  }

  if (typeof a !== "object" || typeof b !== "object") {
    return false;
  }

  const aKeys = Object.keys(a as object);
  const bKeys = Object.keys(b as object);
  if (aKeys.length !== bKeys.length) return false;
  for (const key of aKeys) {
    if (
      !(key in (b as object)) ||
      !isEqual(
        (a as Record<string, unknown>)[key],
        (b as Record<string, unknown>)[key]
      )
    ) {
      return false;
    }
  }
  return true;
}

/** Utility types for return values based on observable presence */
type ReturnValue<O extends Observable<T> | undefined, T> = O extends undefined
  ? T | undefined
  : T;
type ReturnMany<O extends Observable<T> | undefined, T> = O extends undefined
  ? (T | undefined)[]
  : T[];

/**
 * Subscribes to an observable and forces a component update when its value changes.
 * Uses deep equality check to avoid unnecessary updates.
 */
export function useObservable<T, O extends Observable<T> | undefined>(
  ...args:
    | [observable: O, init: T, key?: unknown]
    | [[observable: O, init: T], key?: unknown]
): ReturnValue<O, T> {
  let observable: O;
  let init: T;
  let key: unknown;

  // Normalize arguments
  if (Array.isArray(args[0])) {
    [observable, init] = args[0];
    key = args[1];
  } else {
    observable = args[0] as O;
    init = args[1] as T;
    key = args[2];
  }

  const subscriptionRef = useRef<Subscription>(undefined);
  const keyRef = useRef<unknown>(key);
  const valueRef = useRef<T | undefined>(init as unknown as T);
  const [, update] = useReducer((s: number) => s + 1, 0);

  // Reset initial value if key changes
  if (keyRef.current !== key) {
    keyRef.current = key;
    valueRef.current = init as unknown as T;
  }

  useEffect(() => {
    subscriptionRef.current?.unsubscribe();
    if (!observable) {
      if (valueRef.current !== undefined) {
        valueRef.current = undefined;
        update();
      }
      return;
    }

    subscriptionRef.current = observable.subscribe((value) => {
      if (!isEqual(value, valueRef.current)) {
        valueRef.current = value;
        update();
      }
    });

    return () => {
      subscriptionRef.current?.unsubscribe();
    };
  }, [key ?? observable]);

  return valueRef.current as ReturnValue<O, T>;
}

/**
 * Subscribes to multiple observables and returns an array of their latest values.
 */
export function useManyObservables<T, O extends Observable<T> | undefined>(
  observables: O[],
  init: T[],
  key?: unknown
): ReturnMany<O, T> {
  const observablesRef = useRef<O[]>(observables);
  observablesRef.current = observables;
  const keyRef = useRef<unknown>(key);
  const subscriptionsRef = useRef<Subscription[]>([]);
  const valuesRef = useRef<(T | undefined)[]>(init);
  const [, update] = useReducer((s: number) => s + 1, 0);

  // Reset initial values if key changes
  if (keyRef.current !== key) {
    keyRef.current = key;
    valuesRef.current = init;
  }

  useEffect(() => {
    const current = observablesRef.current;
    for (let i = 0; i < current.length; i++) {
      subscriptionsRef.current[i]?.unsubscribe();
      const obs = current[i];
      if (!obs) {
        valuesRef.current[i] = undefined;
        update();
        continue;
      }
      subscriptionsRef.current[i] = obs.subscribe((value) => {
        const newValues = valuesRef.current.slice();
        newValues[i] = value;
        valuesRef.current = newValues;
        update();
      });
    }

    return () => {
      subscriptionsRef.current.forEach((s) => s.unsubscribe());
    };
  }, [key]);

  return valuesRef.current as ReturnMany<O, T>;
}
