import { StateData } from "@elllphnt/elementa-base";
import {
  Extendable,
  withIdentifiableModelBehavior,
} from "@elllphnt/elementa-utils";
import * as y from "yjs";
import { Component } from "../component";

export type StateModel<D extends StateData = StateData> = ReturnType<
  typeof withIdentifiableModelBehavior<D>
> & {
  component: Component;

  type: string;

  remove(): void;
};

/**
 * Attach State behavior to a y.Map
 */
export function withStateBehavior(
  ymap: y.Map<any>,
  component: Component
): StateModel {
  const state = withIdentifiableModelBehavior<StateData>(
    ymap as Extendable<y.Map<any>>
  ) as Extendable<StateModel>;

  state.component = component;

  Object.defineProperty(state, "type", {
    get() {
      return state.value.type;
    },
  });

  state.remove = () => {
    state.component.states.remove(state);
  };

  return state as StateModel;
}

/**
 * Create a new local State
 */
export function createStateModel(component: Component): StateModel {
  const ymap = new y.Map<any>();
  return withStateBehavior(ymap, component);
}
