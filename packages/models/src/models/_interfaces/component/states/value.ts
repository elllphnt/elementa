import { Observable } from "rxjs";
import { State } from "./state.js";

export interface ValueState extends State {
  init: any;
  init$: Observable<any>;

  tsType: string | undefined;
  tsType$: Observable<string | undefined>;
}
