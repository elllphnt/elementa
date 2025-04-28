import { ElementaEditorComponentStateData } from "@elllphnt/elementa-base";
import {
  attachReactiveMap,
  createEnhancedReactiveList,
  Extendable,
  getOrCreateYArray,
  ReactiveList,
  ReactiveMap,
  setEnhancer,
} from "@elllphnt/elementa-utils";
import * as y from "yjs";
import { Component } from "../../component";
import { attachElementaFrame, ElementaFrame } from "./frame";

export type ElementaEditorComponentState =
  ReactiveMap<ElementaEditorComponentStateData> & {
    component: Component;
    frames: ReactiveList<ElementaFrame>;
  };

export function attachElementaEditorComponentState(
  ymap: y.Map<any>,
  component: Component
): ElementaEditorComponentState {
  const state = attachReactiveMap<ElementaEditorComponentStateData>(
    ymap as Extendable<y.Map<any>>
  ) as Extendable<ElementaEditorComponentState>;

  state.component = component;

  state.frames = createEnhancedReactiveList(
    getOrCreateYArray<y.Map<any>>(state, "frames"),
    attachElementaFrame,
    (frameYMap) => attachElementaFrame(frameYMap, state)
  );

  const baseDispose = (state as any).dispose?.bind(state);
  state.dispose = () => {
    state.frames.dispose();
    if (baseDispose) baseDispose();
  };

  setEnhancer(state, attachElementaEditorComponentState);
  return state as ElementaEditorComponentState;
}

export function createElementaEditorComponentState(
  component: Component
): ElementaEditorComponentState {
  const ymap = new y.Map<any>();
  return attachElementaEditorComponentState(ymap, component);
}
