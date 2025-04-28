import { BlueprintAppStateData } from "@elllphnt/elementa-base";
import {
  attachReactiveMap,
  CRDTModelMap,
  Extendable,
  ReactiveMap,
  withCRDTModelMapBehavior,
} from "@elllphnt/elementa-utils";
import * as y from "yjs";
import { BlueprintNodeModel, withBlueprintNodeBehavior } from "./node";

export type BlueprintAppStateModel = ReturnType<
  typeof attachReactiveMap<BlueprintAppStateData>
> & {
  nodes: CRDTModelMap<y.Map<any>, BlueprintNodeModel>;
};

export function withBlueprintAppStateBehavior(
  ymap: y.Map<any>
): BlueprintAppStateModel {
  const blueprint = attachReactiveMap<BlueprintAppStateData>(
    ymap
  ) as Extendable<ReactiveMap<BlueprintAppStateData>>;

  blueprint.nodes = withCRDTModelMapBehavior(
    blueprint.getOrCreateMap("nodes") as Extendable<y.Map<y.Map<any>>>,
    withBlueprintNodeBehavior
  );

  return blueprint as BlueprintAppStateModel;
}

export function createBlueprintAppStateModel(): BlueprintAppStateModel {
  const ymap = new y.Map<any>();
  return withBlueprintAppStateBehavior(ymap);
}
