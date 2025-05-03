import { Expression, HookStateData } from "@elllphnt/elementa-base";
import { setModelFields } from "@elllphnt/elementa-utils";
import { map, Observable } from "rxjs";
import * as y from "yjs";
import { Component } from "../component";
import { attachState, State } from "./state";

export type HookState = State<HookStateData> & {
  hookUrl: string | undefined;
  hookUrl$: Observable<string | undefined>;

  absoluteHookUrl: string | undefined;
  absoluteHookUrl$: Observable<string | undefined>;

  args: Expression[];
  args$: Observable<Expression[]>;

  arg(index: number): Expression | undefined;
  arg$(index: number): Observable<Expression | undefined>;
};

/**
 * Attach HookState behavior to a y.Map
 */
export function attachHookState(
  ymap: y.Map<any>,
  component: Component
): ymap is HookState {
  if (!attachState(ymap, component)) {
    throw new Error("Failed to attach HookState");
  }
  const state = ymap as HookState;

  setModelFields(state, ["hookUrl", "args"]);

  Object.defineProperty(state, "absoluteHookUrl", {
    get() {
      return state.hookUrl
        ? state.component.project.resolveAbsoluteUrl(state.hookUrl)
        : undefined;
    },
  });

  state.absoluteHookUrl$ = state.hookUrl$.pipe(
    map((url) => {
      return url ? state.component.project.resolveAbsoluteUrl(url) : undefined;
    })
  );

  state.arg = (index: number) => {
    return state.args[index];
  };

  state.arg$ = (index: number) => {
    return state.args$.pipe(map((args) => args[index]));
  };

  state.cloneIds = (clone: y.Map<any>) => {
    state.cloneOwnId(clone);
  };

  return true;
}

/**
 * Create a new local HookState
 */
export function createHookState(component: Component): HookState {
  const ymap = new y.Map<any>();
  if (!attachHookState(ymap, component)) {
    throw new Error("Failed to create HookState");
  }
  return ymap as HookState;
}
