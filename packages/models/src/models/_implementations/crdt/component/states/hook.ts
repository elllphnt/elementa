import { HookStateData } from "@elllphnt/elementa-base";
import {
  assert,
  setEnhancer,
  setObjectGetter,
  setObjectProperty,
  setReactiveMapGetters,
} from "@elllphnt/elementa-utils";
import { map } from "rxjs";
import * as y from "yjs";
import { Component } from "../../../../_interfaces/component/component.js";
import { HookState } from "../../../../_interfaces/component/states/hook.js";
import { attachState } from "./state.js";

export function attachHookState(
  state: y.Map<any>,
  component: Component
): state is y.Map<any> & HookState {
  state.set("type", "hook");

  assert(attachState<HookStateData>(state, component));
  assert(setReactiveMapGetters(state, ["hookUrl", "args"]));

  assert(
    setObjectGetter(state, "absoluteHookUrl", () =>
      state.hookUrl
        ? state.component.project.absoluteFileUrl(state.hookUrl)
        : undefined
    )
  );

  assert(
    setObjectProperty(
      state,
      "absoluteHookUrl$",
      state.hookUrl$.pipe(
        map((url) =>
          url ? state.component.project.absoluteFileUrl(url) : undefined
        )
      )
    )
  );

  assert(
    setObjectProperty(state, "arg", (index: number) => state.args?.[index])
  );

  assert(
    setObjectProperty(state, "arg$", (index: number) =>
      state.args$.pipe(map((args) => args?.[index]))
    )
  );

  const baseDispose = (state as any).dispose?.bind(state);
  (state as any).dispose = () => {
    baseDispose?.();
  };

  return setEnhancer<HookState>(state, attachHookState);
}
