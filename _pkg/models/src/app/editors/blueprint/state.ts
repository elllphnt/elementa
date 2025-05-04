import { BlueprintAppStateData } from "@elllphnt/elementa-base";
import {
  assert,
  attachReactiveMap,
  createEnhancedReactiveList,
  getOrCreateYArray,
  ReactiveList,
  ReactiveMap,
  setEnhancer,
} from "@elllphnt/elementa-utils";
import * as y from "yjs";
import { App } from "../../app";
import { attachBlueprintNode, BlueprintNode } from "./node";

export const blueprintEditorStateKey = "blueprint";

export type BlueprintAppState = ReactiveMap<BlueprintAppStateData> & {
  nodes: ReactiveList<BlueprintNode>;
};

export function attachBlueprintAppState(
  ymap: y.Map<unknown>
): ymap is BlueprintAppState {
  assert(attachReactiveMap<BlueprintAppStateData>(ymap));
  const blueprint = ymap as BlueprintAppState;

  blueprint.nodes = createEnhancedReactiveList(
    getOrCreateYArray<y.Map<unknown>>(ymap, "nodes"),
    attachBlueprintNode,
    (yMap) => attachBlueprintNode(yMap)
  );

  setEnhancer(blueprint, attachBlueprintAppState);
  return true;
}

export function createBlueprintAppState(app: App): BlueprintAppState {
  const blueprint = app.getMapEditorState(blueprintEditorStateKey);
  assert(attachBlueprintAppState(blueprint));
  return blueprint;
}
