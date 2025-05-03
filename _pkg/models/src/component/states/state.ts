import { BaseStateData } from "@elllphnt/elementa-base/dist/types/component/states/_base";
import { setEnhancer } from "@elllphnt/elementa-utils";
import * as y from "yjs";
import { Component } from "../component";
import { attachIdentifiable, Identifiable } from "../identifiable";

export type State<D extends BaseStateData = BaseStateData> = Identifiable<D> & {
  component: Component;
  type: string;
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
