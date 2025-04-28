import { ValueStateData } from "@elllphnt/elementa-base";
import { setModelFields } from "@elllphnt/elementa-utils";
import { Observable } from "rxjs";
import * as y from "yjs";
import { Component } from "../component";
import { attachState, State } from "./state";

export type ValueState = State<ValueStateData> & {
  init: any;
  init$: Observable<any>;

  tsType: string | undefined;
  tsType$: Observable<string | undefined>;
};

/**
 * Attach ValueState behavior to a y.Map
 */
export function attachValueState(
  ymap: y.Map<any>,
  component: Component
): ValueState {
  const state = attachState(ymap, component);
  const valueState = state as ValueState;
  setModelFields(valueState, ["init", "tsType"]);
  return state as ValueState;
}

/**
 * Create a new local ValueState
 */
export function createValueState(component: Component): ValueState {
  const ymap = new y.Map<any>();
  return attachValueState(ymap, component);
}
