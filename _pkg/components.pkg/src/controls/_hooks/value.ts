import { useObservable } from "@repo/utils";
import { Observable } from "rxjs";

export function useControlValue<T>(
  value$?: Observable<T | undefined>,
  value?: T | undefined,
): T | undefined {
  const _value = useObservable(value$, value);
  return value$ ? _value : value;
}
