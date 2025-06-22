import { Observable } from "rxjs";
import { BaseState } from "./_base.js";

export interface InlineState extends BaseState<"inline"> {
  script: string | undefined;
  script$: Observable<string | undefined>;
}
