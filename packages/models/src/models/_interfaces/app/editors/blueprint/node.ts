import { PointData } from "@elllphnt/elementa-utils";
import { Observable } from "rxjs";

export interface BlueprintNode {
  position: PointData;
  position$: Observable<PointData>;
}
