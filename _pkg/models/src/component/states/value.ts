import { ValueStateData } from "@elllphnt/elementa-base";
import { Extendable } from "@elllphnt/elementa-utils";
import { map, distinctUntilChanged, Observable } from "rxjs";
import * as y from "yjs";
import { Component } from "../component";
import { StateModel, withStateBehavior } from "./state";

export type ValueStateModel = StateModel & {
  initialValue: any;
  initialValue$: Observable<any>;

  tsType: string | undefined;
  tsType$: Observable<string | undefined>;

  data: ValueStateData;
  data$: Observable<ValueStateData>;

  setInitialValue(value: any): void;
  setTsType(tsType: string | undefined): void;
  cloneIds(clone: y.Map<any>): void;
};

/**
 * Attach ValueState behavior to a y.Map
 */
export function withValueStateBehavior(
  ymap: y.Map<any>,
  component: Component
): ValueStateModel {
  const state = withStateBehavior(
    ymap,
    component
  ) as Extendable<ValueStateModel>;

  Object.defineProperty(state, "initialValue", {
    get() {
      return state.value.init;
    },
    set(value) {
      state.set("init", value);
    },
  });

  state.initialValue$ = state.value$.pipe(
    map((v) => v.init),
    distinctUntilChanged()
  );

  Object.defineProperty(state, "tsType", {
    get() {
      return state.value.tsType;
    },
    set(value) {
      state.set("tsType", value);
    },
  });

  state.tsType$ = state.value$.pipe(
    map((v) => v.tsType),
    distinctUntilChanged()
  );

  Object.defineProperty(state, "data", {
    get() {
      return state.value;
    },
  });

  state.data$ = state.value$;

  state.setInitialValue = (value: any) => {
    state.set("init", value);
  };

  state.setTsType = (tsType: string | undefined) => {
    state.set("tsType", tsType);
  };

  state.cloneIds = (clone: y.Map<any>) => {
    state.cloneOwnId(clone);
  };

  return state as ValueStateModel;
}

/**
 * Create a new local ValueState
 */
export function createValueStateModel(component: Component): ValueStateModel {
  const ymap = new y.Map<any>();
  return withValueStateBehavior(ymap, component);
}
