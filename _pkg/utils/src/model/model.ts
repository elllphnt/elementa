import { Observable } from "rxjs";

export interface IModel<D> {
  readonly data: D;
  readonly data$: Observable<D>;
  restore(data: D): void;
  dispose(): void;
}
