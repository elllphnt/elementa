import { StateData } from "@elllphnt/elementa-base";
import { BaseStateData } from "@elllphnt/elementa-base/dist/types/component/states/_base";
import { Extendable, setEnhancer } from "@elllphnt/elementa-utils";
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
export function attachState(ymap: y.Map<any>, component: Component): State {
  const state = attachIdentifiable<StateData>(
    ymap as Extendable<y.Map<any>>
  ) as Extendable<State>;

  state.component = component;

  Object.defineProperty(state, "type", {
    get() {
      return state.value.type;
    },
  });

  state.remove = () => {
    state.component.states.delete(
      state.component.states.toArray().indexOf(state)
    );
  };

  setEnhancer(state, attachState);
  return state as State;
}

/**
 * Create a new local State
 */
export function createState(component: Component): State {
  const ymap = new y.Map<any>();
  return attachState(ymap, component);
}
