import { BlueprintAppStateData } from "@elllphnt/elementa-base";
import {
  attachReactiveMap,
  Extendable,
  ReactiveList,
  ReactiveMap,
} from "@elllphnt/elementa-utils";
import * as y from "yjs";
import { App } from "../../app";
import { BlueprintNodeModel, withBlueprintNodeBehavior } from "./node";

export type BlueprintAppState = ReturnType<
  typeof attachReactiveMap<BlueprintAppStateData>
> & {
  nodes: ReactiveList<BlueprintNodeModel>;
};

export function withBlueprintAppStateBehavior(
  ymap: y.Map<any>
): BlueprintAppState {
  const blueprint = attachReactiveMap<BlueprintAppStateData>(
    ymap
  ) as Extendable<ReactiveMap<BlueprintAppStateData>>;

  blueprint.nodes = withCRDTModelMapBehavior(
    blueprint.getOrCreateMap("nodes") as Extendable<y.Map<y.Map<any>>>,
    withBlueprintNodeBehavior
  );

  return blueprint as BlueprintAppState;
}

export function createBlueprintAppState(app: App): BlueprintAppState {
  return withBlueprintAppStateBehavior(app.getMapEditorState("blueprint"));
}
