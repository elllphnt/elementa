import { resolveCommonValue } from "@repo/components";
import { Instance } from "@repo/elementa";
import { combineLatestOrEmpty, useObservable } from "@repo/utils";
import { useCallback, useMemo } from "react";
import { Observable, distinctUntilChanged, map } from "rxjs";

export function useCommonReactivePair<T>(
  value$s: Observable<T>[],
  values: T[],
  key: string,
) {
  const value = resolveCommonValue(values);
  const value$ = useMemo(() => {
    return combineLatestOrEmpty(value$s).pipe(
      map((values) => resolveCommonValue(values)),
      distinctUntilChanged(),
    );
  }, [key]);

  return [value$, value] as const;
}
export function useInstancesCommonReactivePair<I extends Instance, T>({
  instances,
  value,
  value$,
}: {
  instances: I[];
  value$: (instance: I) => Observable<T>;
  value: (instance: I) => T;
}) {
  const vKey = instances.map((instance) => instance.key).join(".");
  const [_value$, _value] = useCommonReactivePair(
    instances.map(value$),
    instances.map(value),
    vKey,
  );
  return [_value$, _value] as const;
}

export function useCommonReactiveValue<T>(
  value$s: Observable<T>[],
  values: T[],
  key: string,
) {
  const [value$, value] = useCommonReactivePair(value$s, values, key);
  return useObservable(value$, value);
}
export function useInstancesCommonReactiveValue<I extends Instance, T>({
  instances,
  value,
  value$,
  setValue,
}: {
  instances: I[];
  value$: (instance: I) => Observable<T>;
  value: (instance: I) => T;
  setValue?: (instance: I, value: T | undefined) => void;
}) {
  const [_value$, _value] = useInstancesCommonReactivePair({
    instances,
    value,
    value$,
  });
  const _setValue = useCallback(
    (_value: T | undefined) => {
      if (setValue) {
        for (const instance of instances) {
          setValue(instance, _value);
        }
      }
    },
    [instances, setValue],
  );

  const __value = useObservable(_value$, _value);

  return [__value, _setValue] as const;
}
