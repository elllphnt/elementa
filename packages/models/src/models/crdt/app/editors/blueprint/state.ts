import { BlueprintAppStateData } from "@elllphnt/elementa-base";
import {
  assert,
  attachEnhancedReactiveList,
  attachReactiveMap,
  getOrCreateYArray,
  setEnhancer,
  setObjectGetter,
  setObjectProperty,
} from "@elllphnt/elementa-utils";
import * as y from "yjs";
import { AppBlueprint, BlueprintNode } from "../../../../_interfaces/_.js";
import { attachBlueprintNode } from "./node.js";

export const blueprintEditorStateKey = "blueprint";

export function attachBlueprintAppState(
  blueprint: y.Map<any>
): blueprint is y.Map<any> & AppBlueprint {
  assert(attachReactiveMap<BlueprintAppStateData>(blueprint));

  assert(setObjectProperty(blueprint, "type", "blueprint" as const));

  const nodeList = getOrCreateYArray<y.Map<any>>(blueprint, "nodes");
  assert(
    attachEnhancedReactiveList<BlueprintNode>(
      nodeList,
      attachBlueprintNode,
      (yMap) => attachBlueprintNode(yMap)
    )
  );

  assert(setObjectProperty(blueprint, "nodes$", nodeList.items$));
  assert(setObjectGetter(blueprint, "nodes", () => nodeList.items));

  return setEnhancer<AppBlueprint>(blueprint, attachBlueprintAppState);
}
