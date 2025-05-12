import { BaseStateData } from "@elllphnt/elementa-base";
import {
  assert,
  ReactiveMap,
  setEnhancer,
  setObjectGetter,
  setObjectProperty,
  setReactiveMapGetters,
} from "@elllphnt/elementa-utils";
import * as y from "yjs";
import { Component } from "../../../_interfaces/component/component.js";
import { Identifiable } from "../../../_interfaces/component/identifiable.js";
import { State } from "../../../_interfaces/component/states/_state.js";
import { attachIdentifiable } from "../identifiable.js";

export function attachState<D extends BaseStateData>(
  state: y.Map<any>,
  component: Component
): state is y.Map<any> & ReactiveMap<D> & Identifiable & State {
  assert(attachIdentifiable<D>(state));

  assert(setObjectProperty(state, "component", component));
  assert(setObjectGetter(state, "type", () => state.get("type")));
  assert(setReactiveMapGetters(state, ["name", "varName"]));

  assert(
    setObjectProperty(state, "remove", () => {
      // TODO: remove from component
    })
  );

  const baseDispose = (state as any).dispose?.bind(state);
  (state as any).dispose = () => {
    baseDispose?.();
  };

  return setEnhancer<State>(state, attachState);
}
