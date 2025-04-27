import { entityTypes, switchEntityType } from "@elllphnt/elementa-base";
import { ModuleState, State, ValueState } from "@elllphnt/elementa-models";
import { Elementa } from "../elementa";
import {
  Instance,
  ModuleStateInstance,
  StateInstance,
  ValueStateInstance,
} from "../instances/_";

export function makeStateInstance({
  state,
  elementa,
  parent,
}: {
  state: State;
  elementa: Elementa;
  parent: Instance | null;
}): StateInstance {
  return switchEntityType<StateInstance>(state.type, {
    [entityTypes.states.value]: () => {
      return new ValueStateInstance({
        entity: state as ValueState,
        elementa,
        parent,
      });
    },
    [entityTypes.states.module]: () => {
      return new ModuleStateInstance({
        entity: state as ModuleState,
        elementa,
        parent,
      });
    },
  });
}
