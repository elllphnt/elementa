import { ValueStateData } from "@elllphnt/elementa-base";
import { assert, setEnhancer, setModelFields } from "@elllphnt/elementa-utils";
import { Observable } from "rxjs";
import * as y from "yjs";
import { Component } from "../component.js";
import { attachState, State } from "./state.js";

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
): ymap is ValueState {
  assert(attachState(ymap, component), "Failed to attach State");
  const state = ymap as State;
  const valueState = state as ValueState;
  setModelFields(valueState, ["init", "tsType"]);

  setEnhancer(valueState, attachValueState);
  return true;
}

/**
 * Create a new local ValueState
 */
export function createValueState(component: Component): ValueState {
  const ymap = new y.Map<any>();
  assert(attachValueState(ymap, component), "Failed to create ValueState");
  return ymap as ValueState;
}
