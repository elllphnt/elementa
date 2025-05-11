import { BlueprintNodeData } from "@elllphnt/elementa-base";
import {
  assert,
  attachReactiveMap,
  PointData,
  ReactiveMap,
  setEnhancer,
  setReactiveMapGetters,
} from "@elllphnt/elementa-utils";
import { Observable } from "rxjs";
import * as y from "yjs";

export type BlueprintNode = ReactiveMap<BlueprintNodeData> & {
  position: PointData;
  position$: Observable<PointData>;
};

export function attachBlueprintNode(ymap: y.Map<any>): ymap is BlueprintNode {
  assert(
    attachReactiveMap<BlueprintNodeData>(ymap),
    "Failed to attach reactive map to ymap"
  );
  const node = ymap as BlueprintNode;

  setReactiveMapGetters(node, ["position"]);

  setEnhancer(node, attachBlueprintNode);
  return true;
}

export function createBlueprintNode(): BlueprintNode {
  const ymap = new y.Map<any>();
  assert(attachBlueprintNode(ymap), "Failed to attach reactive map to ymap");
  return ymap;
}
