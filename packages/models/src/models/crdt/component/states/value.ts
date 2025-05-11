import { ValueStateData } from "@elllphnt/elementa-base";
import {
  assert,
  setEnhancer,
  setReactiveMapGetters,
} from "@elllphnt/elementa-utils";
import * as y from "yjs";
import { Component } from "../../../_interfaces/component/component.js";
import { ValueState } from "../../../_interfaces/component/states/value.js";
import { attachState } from "./state.js";

export function attachValueState(
  state: y.Map<any>,
  component: Component
): state is y.Map<any> & ValueState {
  state.set("type", "value");

  assert(attachState<ValueStateData>(state, component));
  assert(setReactiveMapGetters(state, ["init", "tsType"]));

  const baseDispose = (state as any).dispose?.bind(state);
  (state as any).dispose = () => {
    baseDispose?.();
  };

  return setEnhancer<ValueState>(state, attachValueState);
}
