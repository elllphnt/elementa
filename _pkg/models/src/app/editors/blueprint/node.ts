import { BlueprintNodeData } from "@elllphnt/elementa-base";
import {
  attachReactiveMap,
  Extendable,
  PointData,
  ReactiveMap,
  setEnhancer,
  setModelFields,
} from "@elllphnt/elementa-utils";
import { Observable } from "rxjs";
import * as y from "yjs";

export type BlueprintNode = ReactiveMap<BlueprintNodeData> & {
  position: PointData;
  position$: Observable<PointData>;
};

export function attachBlueprintNode(ymap: y.Map<any>): BlueprintNode {
  const node = attachReactiveMap<BlueprintNodeData>(ymap) as Extendable<
    ReactiveMap<BlueprintNodeData>
  >;

  setModelFields(node, ["position"]);

  setEnhancer(node, attachBlueprintNode);
  return node as BlueprintNode;
}

export function createBlueprintNode(): BlueprintNode {
  const ymap = new y.Map<any>();
  return attachBlueprintNode(ymap);
}
