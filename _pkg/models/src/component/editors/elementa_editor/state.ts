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
  ymap: y.Map<unknown>,
  component: Component
): ElementaEditorComponentState {
  const state = attachReactiveMap<ElementaEditorComponentStateData>(
    ymap as Extendable<y.Map<unknown>>
  ) as Extendable<ElementaEditorComponentState>;

  state.component = component;

  state.frames = createEnhancedReactiveList(
    getOrCreateYArray<y.Map<unknown>>(state, "frames"),
    attachElementaFrame,
    (frameYMap) => attachElementaFrame(frameYMap, state)
  );

  const baseDispose = (state as unknown).dispose?.bind(state);
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
  const ymap = new y.Map<unknown>();
  return attachElementaEditorComponentState(ymap, component);
}
