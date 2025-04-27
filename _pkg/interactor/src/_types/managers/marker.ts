import { Disposable } from "@elllphnt/elementa-utils";
import { Observable } from "rxjs";
import { Marker, RectMarker } from "~/src/primitives/markers";

export interface IMarkerManager extends Disposable {
  get markers$(): Observable<Marker[]>;
  get markers(): Marker[];

  createLineMarker(): Marker;
  createRectMarker(): RectMarker;
  removeMarker(marker: Marker): void;
}
