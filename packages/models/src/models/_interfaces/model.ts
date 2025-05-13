import { Observable } from "rxjs";

export interface Model {
  key: string;
  updated$: Observable<void>;
}
