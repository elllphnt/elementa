import { Observable } from "rxjs";
import { MixedType } from "./_utils/mixed";

export type ControlProps<T = any, S extends {} = any> = {
  value?: T | MixedType | undefined;
  value$?: Observable<T | MixedType | undefined>;
  onChange?: (value: T | undefined) => void;
  settings?: S;
};
