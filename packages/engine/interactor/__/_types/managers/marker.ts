import type { Lifecycle } from "@elllphnt/elementa-utils";
import type { Observable } from "rxjs";
import type { Marker, RectMarker } from "~/primitives/markers";

export interface IMarkerManager extends Lifecycle {
  get markers$(): Observable<Marker[]>;
  get markers(): Marker[];

  createLineMarker(): Marker;
  createRectMarker(): RectMarker;
  removeMarker(marker: Marker): void;
}
