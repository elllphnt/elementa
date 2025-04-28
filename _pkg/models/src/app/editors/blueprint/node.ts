import { BlueprintNodeData } from "@elllphnt/elementa-base";
import {
  attachReactiveMap,
  Extendable,
  PointData,
  ReactiveMap,
} from "@elllphnt/elementa-utils";
import { distinctUntilChanged, map, Observable } from "rxjs";
import * as y from "yjs";

export type BlueprintNodeModel = ReactiveMap<BlueprintNodeData> & {
  position: PointData;
  position$: Observable<PointData>;
};

export function withBlueprintNodeBehavior(
  ymap: y.Map<any>
): BlueprintNodeModel {
  const node = attachReactiveMap<BlueprintNodeData>(ymap) as Extendable<
    ReactiveMap<BlueprintNodeData>
  >;

  // Add methods and accessors
  Object.defineProperty(node, "position", {
    get() {
      return node.value.position;
    },
  });

  node.position$ = node.observable$.pipe(
    map((state) => state.position),
    distinctUntilChanged()
  );

  node.setPosition = (position: PointData) => {
    node.patch({ position });
  };

  return node as BlueprintNodeModel;
}

export function createBlueprintNodeModel(): BlueprintNodeModel {
  const ymap = new y.Map<any>();
  return withBlueprintNodeBehavior(ymap);
}
