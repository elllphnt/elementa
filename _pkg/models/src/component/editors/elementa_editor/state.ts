import { ElementaEditorComponentStateData } from "@elllphnt/elementa-base";
import {
  attachListOfReactives,
  attachReactiveMap,
  Extendable,
  ReactiveListOf,
} from "@elllphnt/elementa-utils";
import * as y from "yjs";
import { Component } from "../../component";
import { ElementaFrameModel, withElementaFrameBehavior } from "./frame";

export type ElementaEditorComponentStateModel = ReturnType<
  typeof attachReactiveMap<ElementaEditorComponentStateData>
> & {
  component: Component;
  frames: ReactiveListOf<y.Map<any>, ElementaFrameModel>;
};

/**
 * Attach ElementaEditorComponentState behavior to a y.Map
 */
export function withElementaEditorComponentStateBehavior(
  ymap: y.Map<any>,
  component: Component
): ElementaEditorComponentStateModel {
  const state = attachReactiveMap<ElementaEditorComponentStateData>(
    ymap as Extendable<y.Map<any>>
  ) as Extendable<ElementaEditorComponentStateModel>;

  state.component = component;

  state.frames = attachListOfReactives(
    state.getOrCreateArray("frames") as Extendable<y.Array<y.Map<any>>>,
    (frameYMap) => withElementaFrameBehavior(frameYMap, state)
  );

  const baseDispose = (state as any).dispose?.bind(state);
  state.dispose = () => {
    state.frames.dispose();
    if (baseDispose) baseDispose();
  };

  return state as ElementaEditorComponentStateModel;
}

/**
 * Create a new local ElementaEditorComponentState model
 */
export function createElementaEditorComponentStateModel(
  component: Component
): ElementaEditorComponentStateModel {
  const ymap = new y.Map<any>();
  return withElementaEditorComponentStateBehavior(ymap, component);
}
