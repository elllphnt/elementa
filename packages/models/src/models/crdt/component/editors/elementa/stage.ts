import {
  assert,
  attachEnhancedReactiveList,
  attachReactiveMap,
  getOrCreateYArray,
  setEnhancer,
  setObjectProperty,
} from "@elllphnt/elementa-utils";
import * as y from "yjs";
import { Project } from "../../../../../infrastructure/_.js";
import { ElementaFrame, ElementaStage } from "../../../../_interfaces/_.js";
import { attachElementaFrame } from "./frame.js";

export function attachElementaEditorComponentState(
  stage: y.Map<any>,
  project: Project
): stage is y.Map<any> & ElementaStage {
  assert(attachReactiveMap(stage));
  assert(setObjectProperty(stage, "project", project));

  const framesList = getOrCreateYArray<y.Map<any>>(stage, "frames");
  assert(
    attachEnhancedReactiveList<ElementaFrame>(
      framesList,
      attachElementaFrame,
      (frameYMap) => attachElementaFrame(frameYMap, stage as any)
    )
  );

  assert(setObjectProperty(stage, "frames", framesList.items));
  assert(setObjectProperty(stage, "frames$", framesList.items$));

  // Cleanup logic
  const baseDispose = (stage as any).dispose?.bind(stage);
  (stage as any).dispose = () => {
    baseDispose?.();
    framesList.dispose();
  };

  return setEnhancer<ElementaStage>(stage, attachElementaEditorComponentState);
}
