import { Lifecycle } from "@elllphnt/elementa-utils";
import { Observable } from "rxjs";
import { Marker, RectMarker } from "~/primitives/markers";

export interface IMarkerManager extends Lifecycle {
  get markers$(): Observable<Marker[]>;
  get markers(): Marker[];

  createLineMarker(): Marker;
  createRectMarker(): RectMarker;
  removeMarker(marker: Marker): void;
}
