import { Lifecycle } from "@elllphnt/elementa-kernel";
import { BehaviorSubject } from "rxjs";
import type { IMarkerManager } from "~/_types/managers/marker.js";
import type { Marker} from "~/primitives/markers.js";
import { LineMarker, RectMarker } from "~/primitives/markers.js";

export class MarkerManager extends Lifecycle implements IMarkerManager {
  private _markers$: BehaviorSubject<Marker[]>;

  get markers$() {
    return this._markers$.asObservable();
  }
  get markers() {
    return this._markers$.value;
  }

  constructor() {
    super();
    this._markers$ = new BehaviorSubject<Marker[]>([]);

    this.addDisposer(() => {
      this._markers$.complete();
    });
  }

  createLineMarker() {
    const marker = new LineMarker();
    this._markers$.next([...this.markers, marker]);
    return marker;
  }

  createRectMarker() {
    const marker = new RectMarker();
    this._markers$.next([...this.markers, marker]);
    return marker;
  }

  removeMarker(marker: Marker) {
    this._markers$.next(this.markers.filter((m) => m !== marker));
  }
}
