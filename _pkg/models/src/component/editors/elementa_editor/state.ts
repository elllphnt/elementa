import { ElementaEditorComponentStateData } from "@elllphnt/elementa-base";
import {
  attachReactiveMap,
  createEnhancedReactiveList,
  getOrCreateYArray,
  ReactiveList,
  ReactiveMap,
  setEnhancer,
} from "@elllphnt/elementa-utils";
import * as y from "yjs";
import { Component } from "../../component.js";
import { attachElementaFrame, ElementaFrame } from "./frame.js";

export type ElementaEditorComponentState =
  ReactiveMap<ElementaEditorComponentStateData> & {
    component: Component;
    frames: ReactiveList<ElementaFrame>;
  };

export function attachElementaEditorComponentState(
  ymap: y.Map<any>,
  component: Component
): ymap is ElementaEditorComponentState {
  const state = attachReactiveMap(
    ymap
  ) as unknown as ElementaEditorComponentState;

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
  return true;
}

export function createElementaEditorComponentState(
  component: Component
): ElementaEditorComponentState {
  const ymap = new y.Map<any>();
  attachElementaEditorComponentState(ymap, component);
  return ymap as ElementaEditorComponentState;
}
