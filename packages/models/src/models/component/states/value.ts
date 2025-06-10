import { Observable } from "rxjs";
import { BaseState } from "./_base.js";

export interface ValueState extends BaseState<"value"> {
  init: any;
  init$: Observable<any>;

  tsType: string | undefined;
  tsType$: Observable<string | undefined>;
}
