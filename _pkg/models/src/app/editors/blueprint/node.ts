import { BlueprintNodeData } from "@elllphnt/elementa-base";
import { MapCRDTModel, PointData } from "@elllphnt/elementa-utils";
import { distinctUntilChanged, map } from "rxjs";
import * as y from "yjs";

export class BlueprintNode extends MapCRDTModel<BlueprintNodeData> {
  get position() {
    return this.state.position;
  }
  get position$() {
    return this.state$.pipe(
      map((state) => state.position),
      distinctUntilChanged()
    );
  }

  constructor(ymap: y.Map<any>) {
    super(ymap);
  }

  setPosition(position: PointData) {
    this.patch({
      position,
    });
  }
}
