import { HookStateData, Expression } from "@elllphnt/elementa-base";
import { Extendable } from "@elllphnt/elementa-utils";
import { map, switchMap, distinctUntilChanged, Observable, of } from "rxjs";
import * as y from "yjs";
import { Component } from "../component";
import { StateModel, withStateBehavior } from "./state";

export type HookStateModel = StateModel<HookStateData> & {
  hookUrl: string | undefined;
  hookUrl$: Observable<string | undefined>;

  absoluteHookUrl: string | undefined;
  absoluteHookUrl$: Observable<string | undefined>;

  args: Expression[];
  args$: Observable<Expression[]>;

  arg(index: number): Expression | undefined;
  arg$(index: number): Observable<Expression | undefined>;

  setHookUrl(hookUrl: string | undefined): void;
  setArg(index: number, parameter: Expression): void;

  cloneIds(clone: y.Map<any>): void;
};

/**
 * Attach HookState behavior to a y.Map
 */
export function withHookStateBehavior(
  ymap: y.Map<any>,
  component: Component
): HookStateModel {
  const state = withStateBehavior(
    ymap,
    component
  ) as Extendable<HookStateModel>;

  Object.defineProperty(state, "hookUrl", {
    get() {
      return state.value.hookUrl;
    },
    set(value) {
      state.set("hookUrl", value);
    },
  });

  state.hookUrl$ = state.value$.pipe(
    map((v) => v.hookUrl),
    distinctUntilChanged()
  );

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

  Object.defineProperty(state, "args", {
    get() {
      return state.value.args ?? [];
    },
    set(value) {
      state.set("args", value);
    },
  });

  state.args$ = state.value$.pipe(
    map((v) => v.args ?? []),
    distinctUntilChanged()
  );

  state.arg = (index: number) => {
    return state.args[index];
  };

  state.arg$ = (index: number) => {
    return state.args$.pipe(map((args) => args[index]));
  };

  state.setArg = (index: number, parameter: Expression) => {
    const newArgs = [...state.args];
    newArgs[index] = parameter;
    state.set("args", newArgs);
  };

  state.setHookUrl = (hookUrl: string | undefined) => {
    state.set("hookUrl", hookUrl);
  };

  state.cloneIds = (clone: y.Map<any>) => {
    state.cloneOwnId(clone);
  };

  return state as HookStateModel;
}

/**
 * Create a new local HookState
 */
export function createHookStateModel(component: Component): HookStateModel {
  const ymap = new y.Map<any>();
  return withHookStateBehavior(ymap, component);
}
