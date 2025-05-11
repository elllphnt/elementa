import { Expression } from "@elllphnt/elementa-base";
import { Observable } from "rxjs";
import { State } from "./state.js";

export interface HookState extends State {
  hookUrl: string | undefined;
  hookUrl$: Observable<string | undefined>;

  absoluteHookUrl: string | undefined;
  absoluteHookUrl$: Observable<string | undefined>;

  args: Expression[] | undefined;
  args$: Observable<Expression[] | undefined>;

  arg(index: number): Expression | undefined;
  arg$(index: number): Observable<Expression | undefined>;
}
