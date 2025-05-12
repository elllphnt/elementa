import { Expression } from "@elllphnt/elementa-base";
import { Observable } from "rxjs";
import { BaseState } from "./_base.js";

export interface HookState extends BaseState<"hook"> {
  hookUrl: string | undefined;
  hookUrl$: Observable<string | undefined>;

  args: Expression[] | undefined;
  args$: Observable<Expression[] | undefined>;

  arg(index: number): Expression | undefined;
  arg$(index: number): Observable<Expression | undefined>;
}
