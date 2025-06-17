import { Observable } from "rxjs";
import { BaseState } from "./_base.js";

export interface HookState extends BaseState<"hook"> {
  hookUrl: string | undefined;
  hookUrl$: Observable<string | undefined>;

  argMode: "positional" | "named";
  argMode$: Observable<"positional" | "named">;

  args: Record<string, any>;
  args$: Observable<Record<string, any>>;

  arg(key: string): any;
  arg$(key: string): Observable<any>;
}
