import { BlueprintAppStateData } from "@elllphnt/elementa-base";
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
import { App } from "../../app";
import { attachBlueprintNode, BlueprintNode } from "./node";

export const blueprintEditorStateKey = "blueprint";

export type BlueprintAppState = ReturnType<
  typeof attachReactiveMap<BlueprintAppStateData>
> & {
  nodes: ReactiveList<BlueprintNode>;
};

export function attachBlueprintAppState(ymap: y.Map<any>): BlueprintAppState {
  const blueprint = attachReactiveMap<BlueprintAppStateData>(
    ymap
  ) as Extendable<ReactiveMap<BlueprintAppStateData>>;

  blueprint.nodes = createEnhancedReactiveList(
    getOrCreateYArray<y.Map<any>>(ymap, "nodes"),
    attachBlueprintNode,
    (yMap) => attachBlueprintNode(yMap)
  );

  setEnhancer(blueprint, attachBlueprintAppState);
  return blueprint as BlueprintAppState;
}

export function createBlueprintAppState(app: App): BlueprintAppState {
  return attachBlueprintAppState(
    app.getMapEditorState(blueprintEditorStateKey)
  );
}
