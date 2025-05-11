import { BaseStateData } from "@elllphnt/elementa-base";
import { setEnhancer, setReactiveMapGetters } from "@elllphnt/elementa-utils";
import { Observable } from "rxjs";
import * as y from "yjs";
import { Component } from "../component.js";
import { attachIdentifiable, Identifiable } from "../identifiable.js";

export type State<D extends BaseStateData = BaseStateData> = Identifiable<D> & {
  component: Component;
  type: string;
  name: string | undefined;
  name$: Observable<string | undefined>;
  varName: string | undefined;
  varName$: Observable<string | undefined>;
  remove(): void;
};

/**
 * Attach State behavior to a y.Map
 */
export function attachState(
  ymap: y.Map<any>,
  component: Component
): ymap is State {
  if (!attachIdentifiable<BaseStateData>(ymap)) {
    throw new Error("Failed to attach identifiable to ymap");
  }
  const state = ymap as State;

  state.component = component;

  Object.defineProperty(state, "type", {
    get() {
      return state.get("type");
    },
  });

  setReactiveMapGetters(state, ["name", "varName"]);

  state.remove = () => {
    state.component.states.delete(
      state.component.states.toArray().indexOf(state)
    );
  };

  setEnhancer(state, attachState);
  return true;
}

/**
 * Create a new local State
 */
export function createState(component: Component): State {
  const ymap = new y.Map<any>();
  if (!attachState(ymap, component)) {
    throw new Error("Failed to create State");
  }
  return ymap as State;
}
