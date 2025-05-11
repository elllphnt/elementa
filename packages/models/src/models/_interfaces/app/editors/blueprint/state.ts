import { Observable } from "rxjs";
import { BlueprintNode } from "./node.js";

export interface AppBlueprint {
  nodes: BlueprintNode[];
  nodes$: Observable<BlueprintNode[]>;
}
