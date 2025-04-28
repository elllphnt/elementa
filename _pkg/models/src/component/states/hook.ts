import { Expression, HookStateData } from "@elllphnt/elementa-base";
import { setModelFields } from "@elllphnt/elementa-utils";
import { distinctUntilChanged, map, Observable } from "rxjs";
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
): HookState {
  const state = attachState(ymap, component) as HookState;

  setModelFields(state, ["hookUrl", "args"]);

  Object.defineProperty(state, "absoluteHookUrl", {
    get() {
      return state.hookUrl
        ? state.component.project.infrastructure.fileSystem.getAbsoluteFileUrl(
            state.component.url,
            state.hookUrl
          )
        : undefined;
    },
  });

  state.absoluteHookUrl$ = state.hookUrl$.pipe(
    map((url) => {
      return url
        ? state.component.project.infrastructure.fileSystem.getAbsoluteFileUrl(
            state.component.url,
            url
          )
        : undefined;
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

  return state as HookState;
}

/**
 * Create a new local HookState
 */
export function createHookState(component: Component): HookState {
  const ymap = new y.Map<any>();
  return attachHookState(ymap, component);
}
