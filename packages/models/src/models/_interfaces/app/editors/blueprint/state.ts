import { BlueprintNodeData } from "@elllphnt/elementa-base";
import { Observable } from "rxjs";

export interface AppBlueprint {
  nodes: BlueprintNodeData[];
  nodes$: Observable<BlueprintNodeData[]>;

  setNodes(data: BlueprintNodeData[]): void;
}
