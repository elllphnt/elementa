import { Observable } from "rxjs";
import { BlueprintNode } from "./node.js";

export interface BlueprintAppState {
  nodes: BlueprintNode[];
  nodes$: Observable<BlueprintNode[]>;
}
