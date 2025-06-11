import { BlueprintNodeData } from "@elllphnt/elementa-base";
import {
  assert,
  attachReactiveMap,
  setEnhancer,
  setReactiveMapGetters,
  setReactiveMapSetters,
} from "@elllphnt/elementa-utils";
import * as y from "yjs";
import { BlueprintNode } from "../../../../../_.js";

export function attachBlueprintNode(
  node: y.Map<any>
): node is y.Map<any> & BlueprintNode {
  assert(attachReactiveMap<BlueprintNodeData>(node));

  assert(setReactiveMapGetters(node, ["position"]));
  assert(setReactiveMapSetters(node, [["setPosition", "position"]] as const));

  return setEnhancer<BlueprintNode>(node, attachBlueprintNode);
}
