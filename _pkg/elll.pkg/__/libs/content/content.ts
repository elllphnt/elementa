import { Observable } from "rxjs";

export interface Content<D = any> {
  readonly url: string;

  readonly name: string | undefined;
  readonly name$: Observable<string | undefined>;

  readonly data: D;
  readonly data$: Observable<D>;

  readonly loading: boolean;
  readonly loading$: Observable<boolean>;

  readonly loaded: boolean;
  readonly loaded$: Observable<boolean>;

  update(data: D): void;
}
